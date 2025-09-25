import { ref, onUnmounted } from 'vue'

export interface SSEEventData {
  event: string
  data: any
  at: string
}

export interface ImportProgressData {
  success: boolean
  phase: string
  message: string
  row?: number
  inserted?: number
  total?: number
}

export interface SSEEvent {
  data: SSEEventData
}

export function useSSE() {
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const eventSource = ref<any>(null) // Store controller for custom SSE
  const eventListeners = ref<Map<string, (event: MessageEvent) => void>>(new Map())

  function connect(url: string, token: string) {
    console.log('=== SSE CONNECT CALLED ===')
    console.log('URL:', url)
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...')
    console.log('Current event listeners count:', eventListeners.value.size)
    
    if (eventSource.value) {
      console.log('Existing connection found, disconnecting first...')
      disconnect()
    }

    try {
      // Sử dụng fetch API để tạo custom SSE connection với Authorization header
      const controller = new AbortController()
      
      console.log('Starting fetch request to SSE endpoint...')
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }).then(response => {
        console.log('=== SSE FETCH RESPONSE RECEIVED ===')
        console.log('SSE fetch response:', response)
        console.log('Response status:', response.status)
        console.log('Response statusText:', response.statusText)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        console.log('Response ok:', response.ok)
        
        if (!response.ok) {
          console.error('SSE response not ok:', response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        isConnected.value = true
        error.value = null
        console.log('SSE connection opened successfully')

        const reader = response.body?.getReader()
        if (!reader) {
          console.error('No response body reader available')
          throw new Error('No response body reader available')
        }
        console.log('Response body reader obtained')

        const decoder = new TextDecoder()
        let buffer = ''
        console.log('TextDecoder created, starting to read stream...')

        const readStream = () => {
          console.log('=== READ STREAM CALLED ===')
          reader.read().then(({ done, value }) => {
            console.log('Stream read result:', { done, valueLength: value?.length })
            
            if (done) {
              console.log('=== SSE STREAM ENDED ===')
              isConnected.value = false
              return
            }

            buffer += decoder.decode(value, { stream: true })
            console.log('=== SSE CHUNK RECEIVED ===')
            console.log('Buffer length:', buffer.length)
            console.log('Raw buffer:', JSON.stringify(buffer))
            
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer
            
            console.log('=== SSE LINES SPLIT ===')
            console.log('Lines count:', lines.length)
            console.log('Lines array:', lines)
            console.log('Remaining buffer:', JSON.stringify(buffer))

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]
              console.log(`=== PROCESSING LINE ${i + 1}/${lines.length} ===`)
              console.log('Line content:', JSON.stringify(line))
              console.log('Line starts with "data: ":', line.startsWith('data: '))
              
              if (line.startsWith('data: ')) {
                const data = line.slice(6) // Remove 'data: ' prefix
                console.log('=== SSE DATA EXTRACTED ===')
                console.log('Data after removing prefix:', JSON.stringify(data))
                console.log('Data trimmed:', JSON.stringify(data.trim()))
                
                if (data.trim()) {
                  try {
                    console.log('Attempting to parse JSON...')
                    const parsedData = JSON.parse(data)
                    console.log('=== SSE DATA PARSED SUCCESSFULLY ===')
                    console.log('Parsed data:', parsedData)
                    console.log('Parsed data type:', typeof parsedData)
                    console.log('Parsed data keys:', Object.keys(parsedData))
                    
                    // Create a MessageEvent-like object
                    const messageEvent = new MessageEvent('message', {
                      data: parsedData
                    })
                    console.log('MessageEvent created:', messageEvent)
                    
                    console.log('=== CALLING SSE EVENT LISTENERS ===')
                    console.log('Event listeners count:', eventListeners.value.size)
                    console.log('Event listeners map:', eventListeners.value)
                    
                    // Call all registered listeners
                    eventListeners.value.forEach((callback, eventType) => {
                      console.log(`Calling SSE callback for event type: ${eventType}`)
                      try {
                        callback(messageEvent)
                        console.log(`SSE callback for ${eventType} executed successfully`)
                      } catch (callbackError) {
                        console.error(`Error in SSE callback for ${eventType}:`, callbackError)
                      }
                    })
                  } catch (parseError) {
                    console.error('=== ERROR PARSING SSE DATA ===')
                    console.error('Parse error:', parseError)
                    console.error('Raw data that failed to parse:', JSON.stringify(data))
                    console.error('Data length:', data.length)
                  }
                } else {
                  console.log('Data is empty after trimming, skipping...')
                }
              } else {
                console.log('Line does not start with "data: ", skipping...')
              }
            }

            readStream()
          }).catch(err => {
            if (err.name !== 'AbortError') {
              console.error('SSE stream error:', err)
              error.value = 'Lỗi kết nối SSE'
              isConnected.value = false
            }
          })
        }

        readStream()

        // Lưu controller để có thể abort khi disconnect
        eventSource.value = { controller }

      }).catch(err => {
        console.error('SSE fetch error:', err)
        if (err.name !== 'AbortError') {
          console.error('SSE connection error:', err)
          error.value = 'Lỗi kết nối SSE'
          isConnected.value = false
        }
      })

    } catch (err) {
      console.error('Failed to create SSE connection:', err)
      error.value = 'Không thể tạo kết nối SSE'
    }
  }

  function disconnect() {
    if (eventSource.value) {
      console.log('Closing SSE connection...')
      // Nếu là custom SSE connection với controller
      if (eventSource.value.controller) {
        eventSource.value.controller.abort()
      } else {
        // Nếu là EventSource thông thường
        eventSource.value.close()
      }
      eventSource.value = null
    }
    
    isConnected.value = false
    error.value = null
    eventListeners.value.clear()
    console.log('SSE connection closed')
  }

  function addEventListener(eventType: string, callback: (event: MessageEvent) => void) {
    console.log('=== ADDING SSE EVENT LISTENER ===')
    console.log('Event type:', eventType)
    console.log('Callback function:', callback.name || 'anonymous')
    console.log('Current listeners before add:', eventListeners.value.size)
    
    eventListeners.value.set(eventType, callback)
    
    console.log('Current listeners after add:', eventListeners.value.size)
    console.log('All listeners:', Array.from(eventListeners.value.keys()))
  }

  function removeEventListener(eventType: string, _callback: (event: MessageEvent) => void) {
    console.log('=== REMOVING SSE EVENT LISTENER ===')
    console.log('Event type:', eventType)
    console.log('Current listeners before remove:', eventListeners.value.size)
    
    eventListeners.value.delete(eventType)
    
    console.log('Current listeners after remove:', eventListeners.value.size)
    console.log('Remaining listeners:', Array.from(eventListeners.value.keys()))
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    error,
    eventListeners,
    connect,
    disconnect,
    addEventListener,
    removeEventListener
  }
}
