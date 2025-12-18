const FACEPP_API_KEY = process.env.FACEPP_API_KEY!
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET!
const FACEPP_BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3'

export interface FaceRectangle {
  top: number
  left: number
  width: number
  height: number
}

export interface DetectedFace {
  face_token: string
  face_rectangle: FaceRectangle
}

export interface DetectResponse {
  faces: DetectedFace[]
  image_id: string
  face_num: number
}

export interface CompareResponse {
  confidence: number
  thresholds: {
    '1e-3': number
    '1e-4': number
    '1e-5': number
  }
}

// Fotoğraftaki yüzleri tespit et
export async function detectFaces(imageUrl: string): Promise<DetectedFace[]> {
  try {
    const formData = new FormData()
    formData.append('api_key', FACEPP_API_KEY)
    formData.append('api_secret', FACEPP_API_SECRET)
    formData.append('image_url', imageUrl)
    formData.append('return_landmark', '0')
    formData.append('return_attributes', 'none')

    const response = await fetch(`${FACEPP_BASE_URL}/detect`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.error_message) {
      console.error('Face++ detect error:', data.error_message)
      return []
    }

    return data.faces || []
  } catch (error) {
    console.error('Face++ detect error:', error)
    return []
  }
}

// İki yüzü karşılaştır
export async function compareFaces(faceToken1: string, faceToken2: string): Promise<number> {
  try {
    const formData = new FormData()
    formData.append('api_key', FACEPP_API_KEY)
    formData.append('api_secret', FACEPP_API_SECRET)
    formData.append('face_token1', faceToken1)
    formData.append('face_token2', faceToken2)

    const response = await fetch(`${FACEPP_BASE_URL}/compare`, {
      method: 'POST',
      body: formData,
    })

    const data: CompareResponse = await response.json()

    if ((data as any).error_message) {
      console.error('Face++ compare error:', (data as any).error_message)
      return 0
    }

    return data.confidence || 0
  } catch (error) {
    console.error('Face++ compare error:', error)
    return 0
  }
}

// Selfie ile fotoğrafı karşılaştır (URL kullanarak)
export async function compareWithSelfie(selfieUrl: string, photoUrl: string): Promise<number> {
  try {
    const formData = new FormData()
    formData.append('api_key', FACEPP_API_KEY)
    formData.append('api_secret', FACEPP_API_SECRET)
    formData.append('image_url1', selfieUrl)
    formData.append('image_url2', photoUrl)

    const response = await fetch(`${FACEPP_BASE_URL}/compare`, {
      method: 'POST',
      body: formData,
    })

    const data: CompareResponse = await response.json()

    if ((data as any).error_message) {
      console.error('Face++ compare error:', (data as any).error_message)
      return 0
    }

    return data.confidence || 0
  } catch (error) {
    console.error('Face++ compare error:', error)
    return 0
  }
}
