import { useState, useCallback, useEffect } from 'react'
import { ENVS } from '../constants/envs'

function buildBody(params) {
  return {
    ApiKey: '', OrgId: 0, ApiParams: params,
    ResponseId: 0, Path: '', Module: '',
    UserId: 0, UserDetails: '', UserSessionModel: '',
    Language: '', FormAction: 0,
  }
}

export function useCacheKeys(env) {
  const [keys,    setKeys]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const base = `${ENVS[env].host}/api/publicservice/Config`

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`${base}/GetAllCacheKeys`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody({ KeyName: '', Source: '' })),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setKeys((data.CustomObject || []).map(k => ({ key: k.KeyName, service: k.Source, id: k.Id })))
    } catch (err) {
      setError(err.message)
      setKeys([])
    } finally {
      setLoading(false)
    }
  }, [base])

  const deleteKey = useCallback(async (keyName, source) => {
    try {
      await fetch(`${base}/GetDeleteCacheKey`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody({ KeyName: keyName, Source: source })),
      })
    } catch (_) { /* CORS may block response but server processes delete */ }
    await fetchKeys()
  }, [base, fetchKeys])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  return { keys, loading, error, fetchKeys, deleteKey }
}
