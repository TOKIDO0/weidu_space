(function () {
  if (typeof window === 'undefined') return
  if (window.__UNISTUDIO_LOADER_INITIALIZED__) return
  window.__UNISTUDIO_LOADER_INITIALIZED__ = true

  const projectNodes = document.querySelectorAll('[data-us-project]')
  if (!projectNodes.length) return

  const fallbackNodes = document.querySelectorAll('[data-unicorn-fallback]')
  const mobileVideos = document.querySelectorAll('[data-unicorn-mobile-video]')
  const desktopWrappers = document.querySelectorAll('[data-unicorn-desktop-wrapper]')
  const isMobile =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 768px)').matches
      : false

  const showFallback = () => {
    fallbackNodes.forEach((node) => node.classList.add('is-visible'))
  }

  const hideFallback = () => {
    fallbackNodes.forEach((node) => node.classList.remove('is-visible'))
  }

  const hideDesktopCanvas = () => {
    desktopWrappers.forEach((wrapper) => wrapper.classList.add('is-hidden'))
  }

  const showDesktopCanvas = () => {
    desktopWrappers.forEach((wrapper) => wrapper.classList.remove('is-hidden'))
  }

  const activateMobileVideo = () => {
    if (!mobileVideos.length) return false
    mobileVideos.forEach((video) => {
      video.classList.add('is-visible')
      const playPromise = video.play?.()
      if (playPromise?.catch) {
        playPromise.catch(() => {})
      }
    })
    hideDesktopCanvas()
    hideFallback()
    return true
  }

  const deactivateMobileVideo = () => {
    mobileVideos.forEach((video) => video.classList.remove('is-visible'))
    showDesktopCanvas()
  }

  const initUnicorn = () => {
    if (!window.UnicornStudio) {
      showFallback()
      return
    }

    try {
      if (!window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init()
        window.UnicornStudio.isInitialized = true
      }
      hideFallback()
    } catch (error) {
      console.error('[unicorn-loader] 初始化失败:', error)
      showFallback()
    }
  }

  const loadScript = () =>
    new Promise((resolve, reject) => {
      if (window.UnicornStudio) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'vendor/unicornStudio.umd.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = (error) => reject(error)
      document.head.appendChild(script)
    })

  if (isMobile) {
    if (activateMobileVideo()) {
      return
    }
    showFallback()
    return
  }

  deactivateMobileVideo()

  const timeoutDuration = 3500
  const fallbackTimer = setTimeout(() => {
    if (!window.UnicornStudio?.isInitialized) {
      showFallback()
    }
  }, timeoutDuration)

  loadScript()
    .then(() => {
      initUnicorn()
      clearTimeout(fallbackTimer)
    })
    .catch((error) => {
      console.error('[unicorn-loader] 脚本加载失败:', error)
      showFallback()
    })

  window.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      initUnicorn()
    }
  })
})()
