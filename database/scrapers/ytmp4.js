import axios from 'axios'

export async function getVideoInfo(url) {
  const { data } = await axios.post('https://api.ytmp4.fit/api/video-info', { url }, {
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://ytmp4.fit', 'Referer': 'https://ytmp4.fit/' }
  })
  if (!data || !data.title) throw new Error('Falha ao pegar info do vídeo.')
  return data
}

export async function getDownloadLink(url, quality) {
  const res = await axios.post('https://api.ytmp4.fit/api/download', { url, quality }, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/octet-stream', 'Origin': 'https://ytmp4.fit', 'Referer': 'https://ytmp4.fit/' },
    responseType: 'arraybuffer'
  })
  if (!res.headers['content-type'].includes('video')) throw new Error('Link de download não disponível.')
  return Buffer.from(res.data)
}