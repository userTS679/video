import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoCallViewProps {
  channelName: string;
  token: string;
  uid: number;
  onUserJoined?: (uid: number) => void;
  onUserLeft?: (uid: number) => void;
  onError?: (error: any) => void;
}

export const VideoCallView: React.FC<VideoCallViewProps> = ({
  channelName,
  token,
  uid,
  onUserJoined,
  onUserLeft,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Call</title>
        <script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            }
            
            #video-container {
                position: relative;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #remote-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.1);
            }
            
            #local-video {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 120px;
                height: 160px;
                border-radius: 15px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                object-fit: cover;
                background: rgba(0, 0, 0, 0.2);
                z-index: 10;
            }
            
            .loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                text-align: center;
            }
            
            .loading h2 {
                font-size: 24px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .loading p {
                font-size: 16px;
                opacity: 0.8;
                margin: 5px 0;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 20px 0;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .error {
                color: #ff6b6b;
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 15px;
                text-align: center;
                margin: 20px;
            }
        </style>
    </head>
    <body>
        <div id="video-container">
            <div class="loading" id="loading">
                <h2>🎥 Setting up your call</h2>
                <div class="spinner"></div>
                <p>Connecting to the video chat...</p>
                <p>Make sure your camera and mic are ready! 📹🎤</p>
            </div>
            <video id="remote-video" style="display: none;" autoplay playsinline></video>
            <video id="local-video" style="display: none;" autoplay playsinline muted></video>
        </div>

        <script>
            let rtc = {
                client: null,
                localAudioTrack: null,
                localVideoTrack: null,
            };

            const appId = "${process.env.EXPO_PUBLIC_AGORA_APP_ID || 'demo-app-id'}";
            const channelName = "${channelName}";
            const token = "${token}";
            const uid = ${uid};

            async function startBasicCall() {
                try {
                    // Create Agora client
                    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
                    
                    // Add event listeners
                    rtc.client.on("user-published", async (user, mediaType) => {
                        await rtc.client.subscribe(user, mediaType);
                        console.log("Remote user published:", user.uid, mediaType);
                        
                        if (mediaType === 'video') {
                            const remoteVideoTrack = user.videoTrack;
                            const remoteVideo = document.getElementById('remote-video');
                            remoteVideoTrack.play(remoteVideo);
                            remoteVideo.style.display = 'block';
                            document.getElementById('loading').style.display = 'none';
                        }
                        
                        if (mediaType === 'audio') {
                            const remoteAudioTrack = user.audioTrack;
                            remoteAudioTrack.play();
                        }
                        
                        // Notify React Native about user joined
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'user-joined',
                            uid: user.uid
                        }));
                    });

                    rtc.client.on("user-unpublished", (user, mediaType) => {
                        console.log("Remote user unpublished:", user.uid, mediaType);
                        if (mediaType === 'video') {
                            document.getElementById('remote-video').style.display = 'none';
                            document.getElementById('loading').style.display = 'flex';
                        }
                        
                        // Notify React Native about user left
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'user-left',
                            uid: user.uid
                        }));
                    });

                    // Join channel
                    await rtc.client.join(appId, channelName, token, uid);
                    console.log("Joined channel successfully");

                    // Create local tracks
                    [rtc.localAudioTrack, rtc.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                    
                    // Play local video
                    const localVideo = document.getElementById('local-video');
                    rtc.localVideoTrack.play(localVideo);
                    localVideo.style.display = 'block';

                    // Publish local tracks
                    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
                    console.log("Published local tracks");
                    
                    // Notify React Native that we're ready
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'call-ready'
                    }));

                } catch (error) {
                    console.error("Error starting call:", error);
                    document.getElementById('loading').innerHTML = 
                        '<div class="error"><h3>❌ Connection Error</h3><p>Could not start video call. Please check your connection and try again.</p></div>';
                    
                    // Notify React Native about error
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'error',
                        error: error.message
                    }));
                }
            }

            // Control functions
            window.muteAudio = () => {
                if (rtc.localAudioTrack) {
                    rtc.localAudioTrack.setEnabled(false);
                }
            };

            window.unmuteAudio = () => {
                if (rtc.localAudioTrack) {
                    rtc.localAudioTrack.setEnabled(true);
                }
            };

            window.muteVideo = () => {
                if (rtc.localVideoTrack) {
                    rtc.localVideoTrack.setEnabled(false);
                    document.getElementById('local-video').style.display = 'none';
                }
            };

            window.unmuteVideo = () => {
                if (rtc.localVideoTrack) {
                    rtc.localVideoTrack.setEnabled(true);
                    document.getElementById('local-video').style.display = 'block';
                }
            };

            window.endCall = async () => {
                try {
                    // Close local tracks
                    if (rtc.localAudioTrack) {
                        rtc.localAudioTrack.close();
                    }
                    if (rtc.localVideoTrack) {
                        rtc.localVideoTrack.close();
                    }
                    
                    // Leave channel
                    if (rtc.client) {
                        await rtc.client.leave();
                    }
                    
                    console.log("Call ended successfully");
                } catch (error) {
                    console.error("Error ending call:", error);
                }
            };

            // Start the call when page loads
            document.addEventListener('DOMContentLoaded', startBasicCall);
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'user-joined':
          onUserJoined?.(data.uid);
          setIsReady(true);
          break;
        case 'user-left':
          onUserLeft?.(data.uid);
          break;
        case 'call-ready':
          setIsReady(true);
          break;
        case 'error':
          onError?.(data.error);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const muteAudio = () => {
    webViewRef.current?.postMessage('muteAudio');
  };

  const unmuteAudio = () => {
    webViewRef.current?.postMessage('unmuteAudio');
  };

  const muteVideo = () => {
    webViewRef.current?.postMessage('muteVideo');
  };

  const unmuteVideo = () => {
    webViewRef.current?.postMessage('unmuteVideo');
  };

  const endCall = () => {
    webViewRef.current?.postMessage('endCall');
  };

  // Expose control methods
  React.useImperativeHandle(React.forwardRef(() => webViewRef), () => ({
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    endCall,
  }));

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        onMessage={handleMessage}
        onError={(error) => {
          console.error('WebView error:', error);
          onError?.(error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});