import mcache from 'memory-cache'

export function cacheThisRoute(durationInSeconds: number) {
  return (req: any, res: any, next: any) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const key = `__express__${req.originalUrl || req.url}`
    const cachedBody = mcache.get(key)

    if (cachedBody) {
      res.send(cachedBody)
      return
    }

    res.sendResponse = res.send
    res.send = (body: any) => {
      mcache.put(key, body, durationInSeconds * 1000)
      res.sendResponse(body)
    }
    next()
  }
}
