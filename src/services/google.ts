import GoogleUser = gapi.auth2.GoogleUser

const GOOGLE_CONFIG = {
  clientId: '810823480274-dtv4gsl3uslm10l8nn4ngd2geb5migqi.apps.googleusercontent.com',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scopes: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive.file',
  ],
}

interface Metadata {
  mimeType: string,
  name?: string,
  parents?: string[],
  contentHints?: { indexableText?: string }
}

const multipartRequest = (metadata: Metadata, content: string) => {
  const boundary = '-------314159265358979323846'
  const delimiter = '\r\n--' + boundary + '\r\n'
  const closeDelimiter = '\r\n--' + boundary + '--'
  const base64Data = btoa(content)

  const body = `
    ${delimiter}Content-Type: application/json

    ${JSON.stringify(metadata)}
    ${delimiter}Content-Type: ${metadata.mimeType}\r\nContent-Transfer-Encoding: base64

    ${base64Data}
    ${closeDelimiter}
  `
  return {
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': `multipart/mixed; boundary="${boundary}"`,
    },
    body,
  }
}

export const init = async () => {
  await new Promise(resolve => gapi.load('client:auth2', resolve))
  const { scopes, ...config } = GOOGLE_CONFIG
  await gapi.client.init({ scope: scopes.join(' '), ...config })
}


export const onSignInOrOut = async (callback: (user: GoogleUser | null) => void) => {
  const auth = gapi.auth2.getAuthInstance()
  const getUser = (isSignedIn: boolean) => isSignedIn ? auth.currentUser.get() : null

  callback(getUser(auth.isSignedIn.get()))

  return auth.isSignedIn.listen(isSignedIn => callback(getUser(isSignedIn)))
}


export const signIn = () => gapi.auth2.getAuthInstance().signIn()


export const signOut = () => gapi.auth2.getAuthInstance().signOut()


export const readFile = async <T>(fileId: string): Promise<T> => {
  const { result } = await gapi.client.request({
    path: `/drive/v3/files/${fileId}`,
    method: 'GET',
    params: { fileId, alt: 'media' },
  })
  return result as T
}


export const updateFile = async (fileId: string, metadata: Metadata, content: string) => {
  await gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    ...multipartRequest(metadata, content),
  })
}

export const createFile = async (metadata: Metadata, content: string) => {
  const { result } = await gapi.client.request({
    path: 'upload/drive/v3/files',
    method: 'POST',
    ...multipartRequest(metadata, content),
  })

  return (result as any).id
}