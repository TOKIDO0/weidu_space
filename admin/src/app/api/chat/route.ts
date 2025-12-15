import { NextRequest, NextResponse } from "next/server"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

// 允许跨域请求（用于前台HTML页面访问）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { message, contextData, model = "gemini-1.5-pro" } = await request.json()

    // 从环境变量获取 API Key（只使用服务器端变量，确保安全）
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key 未配置，请在服务器端环境变量中设置 GEMINI_API_KEY" },
        { status: 500 }
      )
    }

    // 构建系统提示
    const systemPrompt = `你是一个公司网站的智能助手，可以帮助用户回答各种问题。你可以回答关于维度空间设计工作室的公司信息、服务内容、设计理念、装修流程等问题，也可以回答其他任何问题。

公司信息：
- 维度空间室内设计工作室，专注于高品质私宅定制与商业空间策划
- 服务范围：私宅全案设计、商业空间策划、软装陈列定制
- 联系方式：电话 177-7229-7239，邮箱 1810266895@qq.com
- 地址：新和县迎宾花园小区

${contextData ? `
已发布项目：
${contextData.projects?.map((p: any) => 
  `  - ${p.title}（${p.category || '未分类'}，${p.location || '未指定地点'}）`
).join('\n') || '暂无'}

客户评价：
${contextData.reviews?.map((r: any) => 
  `  - ${r.name || '匿名'}：${r.content?.substring(0, 50) || ''}`
).join('\n') || '暂无'}
` : ''}

重要限制：
- 不得透露后台管理相关的数据，如项目总数、待处理需求数量、预约数量等
- 不得透露客户的具体联系信息
- 只能使用公开的项目信息和评价信息

请用中文回答，回答要准确、有帮助性。回答格式要尽量干净，可以使用markdown格式让内容更清晰。不得使用*号出现在回复中，同时不能包含任何违法违规的内容。`

    const fullPrompt = `${systemPrompt}\n\n用户问题：${message}`

    // 调用 Gemini API（使用动态模型）
    const modelName = model || "gemini-1.5-pro"
    const response = await fetch(
      `${GEMINI_API_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      let errorText = ""
      let errorMessage = "AI 服务暂时不可用"
      
      try {
        errorText = await response.text()
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error?.message) {
              errorMessage = errorData.error.message
            } else if (errorData.error) {
              errorMessage = typeof errorData.error === 'string' ? errorData.error : "AI 服务暂时不可用"
            }
          } catch (e) {
            // 如果无法解析为JSON，使用原始文本
            errorMessage = errorText || "AI 服务暂时不可用"
          }
        }
      } catch (e) {
        console.error("读取错误响应失败:", e)
      }
      
      console.error("Gemini API 错误:", response.status, errorText)
      return NextResponse.json(
        { error: errorMessage },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    let data
    try {
      const responseText = await response.text()
      if (!responseText || responseText.trim() === "") {
        return NextResponse.json(
          { error: "AI 服务返回了空响应" },
          { 
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          }
        )
      }
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("解析响应JSON失败:", e)
      return NextResponse.json(
        { error: "AI 服务返回了无效的响应格式" },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    const assistantText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "抱歉，我无法生成回复。"

    if (!assistantText || assistantText.trim() === "") {
      return NextResponse.json(
        { error: "AI 服务返回了空回复" },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    return NextResponse.json(
      { message: assistantText },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error: any) {
    console.error("API 路由错误:", error)
    const errorMessage = error.message || "服务器错误，请检查网络连接或稍后重试"
    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

