import { createClient } from '@supabase/supabase-js'

/**
 * Vercel serverless 函数：根据手机号返回项目进度
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const phone = String(req.query.phone || '').trim()
  if (!phone) {
    return res.status(400).json({ error: '手机号必填' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase 配置缺失' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  try {
    const { data: progressData, error: progressError } = await supabase
      .from('project_progress')
      .select('id, project_id, stage, title, description, images, videos, progress_date, created_at, updated_at, customer_phone')
      .eq('customer_phone', phone)
      .order('progress_date', { ascending: false })

    if (progressError) {
      throw progressError
    }

    const projectIds = [...new Set(progressData.map(item => item.project_id))].filter(Boolean)
    let projectMap = {}

    if (projectIds.length > 0) {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, title')
        .in('id', projectIds)

      if (projectsError) {
        throw projectsError
      }

      projectMap = (projectsData || []).reduce((acc, project) => {
        acc[project.id] = project
        return acc
      }, {})
    }

    const responseData = progressData.map(progress => ({
      ...progress,
      project: projectMap[progress.project_id] || null
    }))

    return res.status(200).json({ data: responseData })
  } catch (error) {
    console.error('[project-progress] 查询失败:', error)
    return res.status(500).json({ error: '查询项目进度失败' })
  }
}
