import FetchAdater from './fetch'
import XHRAdatper from './xhr'
import HTTPAdatper from './http'

export default function autoAdapter () {
  const win = typeof window !== 'undefined' && window

  if (win) {
    if (typeof win.fetch !== 'undefined') {
      return new FetchAdater()
    }
    return new XHRAdatper()
  }

  return new HTTPAdatper()
}
