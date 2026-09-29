'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Room,
  RoomEvent,
  RemoteTrack,
  LocalTrackPublication,
} from 'livekit-client';

type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  message_type?: string;
};

type Props = {
  bookingId: string;
};

type ConsultationMode = 'chat' | 'audio' | 'video';

export default function ConsultationRoom({ bookingId }: Props) {
  const [accessToken, setAccessToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  const [roomToken, setRoomToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [livekitUrl, setLivekitUrl] = useState('');

  const [mode, setMode] = useState<ConsultationMode>('chat');

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const [error, setError] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const supabaseRef = useRef(
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    let active = true;

    (async () => {
      const supabase = supabaseRef.current;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session?.access_token || !session.user) {
        setError('Please log in to join this consultation.');
        setLoading(false);
        return;
      }

      setAccessToken(session.access_token);
      setCurrentUserId(session.user.id);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`consultation:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const msg = payload.new as Message;

          setMessages((prev) =>
            prev.some((m) => m.id === msg.id)
              ? prev
              : [...prev, msg]
          );
        }
      )
      .subscribe();
const syncMessages = async () => {
  try {
    const response = await fetch(
      `/api/consultation/messages?bookingId=${encodeURIComponent(
        bookingId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    const incoming: Message[] = data.messages || [];

    setMessages((current) => {
      const merged = [...current];

      for (const message of incoming) {
        if (!merged.some((m) => m.id === message.id)) {
          merged.push(message);
        }
      }

      return merged.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    });
  } catch {
    // Realtime remains primary; next sync will retry.
  }
};

const messageSyncInterval = window.setInterval(
  syncMessages,
  3000
);

    (async () => {
      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };

        const history = await fetch(
          `/api/consultation/messages?bookingId=${encodeURIComponent(
            bookingId
          )}`,
          { headers }
        );

        const historyJson = await history.json();

        if (!history.ok) {
          throw new Error(
            historyJson.error || 'Unable to load messages'
          );
        }

        if (!cancelled) {
  const historyMessages: Message[] =
    historyJson.messages || [];

  setMessages((current) => {
    const merged = [...historyMessages];

    for (const message of current) {
      if (!merged.some((m) => m.id === message.id)) {
        merged.push(message);
      }
    }

    return merged.sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );
  });
}

        const fileResponse = await fetch(
          `/api/consultation/files?bookingId=${encodeURIComponent(
            bookingId
          )}`,
          { headers }
        );

        const fileJson = await fileResponse.json();

        if (fileResponse.ok && !cancelled) {
          setFiles(fileJson.files || []);
        }

        const tokenResponse = await fetch(
          '/api/consultation/token',
          {
            method: 'POST',
            headers: {
              ...headers,
              'content-type': 'application/json',
            },
            body: JSON.stringify({ bookingId }),
          }
        );

        const tokenJson = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(
            tokenJson.error ||
              'Unable to authorize consultation'
          );
        }

        if (!cancelled) {
          const bookingMode = String(
            tokenJson.mode || 'chat'
          ).toLowerCase();

          setMode(
            bookingMode === 'video'
              ? 'video'
              : bookingMode === 'audio'
              ? 'audio'
              : 'chat'
          );

          setRoomToken(tokenJson.token || '');
          setRoomName(tokenJson.room || '');
          setLivekitUrl(tokenJson.url || '');
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e.message || 'Unable to open consultation'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(messageSyncInterval);
      supabase.removeChannel(channel);
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (mode === 'chat') {
      setConnected(true);
      setMicOn(false);
      setCameraOn(false);
      return;
    }

    if (!roomToken || !livekitUrl) return;

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    roomRef.current = room;

    const attachTrack = (track: RemoteTrack | any) => {
      const element = track.attach();

      element.setAttribute(
        'data-booking-track',
        bookingId
      );

      videoRef.current?.appendChild(element);
    };

    const detachTrack = (track: any) => {
      track
        .detach()
        .forEach((el: HTMLElement) => el.remove());
    };

    room.on(
      RoomEvent.TrackSubscribed,
      (track) => attachTrack(track)
    );

    room.on(
      RoomEvent.TrackUnsubscribed,
      (track) => detachTrack(track)
    );

    room.on(
  RoomEvent.LocalTrackPublished,
  (publication: LocalTrackPublication) => {
    const track = publication.track;

    if (
      track &&
      track.kind === 'video'
    ) {
      attachTrack(track);
    }
  }
);

    room.on(RoomEvent.Disconnected, () => {
      setConnected(false);
    });

    (async () => {
      try {
        await room.connect(livekitUrl, roomToken);

        await room.localParticipant.setMicrophoneEnabled(
          true
        );

        setMicOn(true);

        if (mode === 'video') {
          await room.localParticipant.setCameraEnabled(
            true
          );

          setCameraOn(true);
        } else {
          await room.localParticipant.setCameraEnabled(
            false
          );

          setCameraOn(false);
        }

        setConnected(true);
      } catch (e: any) {
        setError(
          e.message ||
            'Unable to connect to consultation room'
        );
      }
    })();

    return () => {
      room.disconnect();
      roomRef.current = null;
    };
  }, [
    roomToken,
    livekitUrl,
    bookingId,
    mode,
  ]);

  async function send() {
    const message = text.trim();

    if (!message || !accessToken) return;

    const response = await fetch(
      '/api/consultation/messages',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bookingId,
          message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Message failed');
      return;
    }

    setMessages((prev) =>
      prev.some((m) => m.id === result.message.id)
        ? prev
        : [...prev, result.message]
    );

    setText('');
  }

  async function toggleMic() {
    if (!roomRef.current) return;

    const next = !micOn;

    await roomRef.current.localParticipant
      .setMicrophoneEnabled(next);

    setMicOn(next);
  }

  async function toggleCamera() {
    if (!roomRef.current || mode !== 'video') return;

    const next = !cameraOn;

    await roomRef.current.localParticipant
      .setCameraEnabled(next);

    setCameraOn(next);
  }

  function leave() {
    roomRef.current?.disconnect();
    setConnected(false);
    setMicOn(false);
    setCameraOn(false);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError('');

    try {
      const form = new FormData();

      form.append('bookingId', bookingId);
      form.append('file', file);

      const response = await fetch(
        '/api/consultation/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Upload failed'
        );
      }

      setFiles((prev) => [...prev, result.file]);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function downloadFile(fileId: string) {
    const response = await fetch(
      `/api/consultation/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Download failed');
      return;
    }

    window.open(
      result.url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'system-ui',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>
            Consultation Room
          </h1>

          <small>
            {mode.toUpperCase()} Consultation
            {roomName ? ` · ${roomName}` : ''}
          </small>
        </div>

        <span
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: '1px solid #ddd',
          }}
        >
          {connected
            ? mode === 'chat'
              ? 'Chat Ready'
              : 'Connected'
            : loading
            ? 'Connecting...'
            : 'Not connected'}
        </span>
      </header>

      {error && (
        <p
          role="alert"
          style={{
            background: '#fff3f3',
            padding: 12,
            borderRadius: 8,
          }}
        >
          {error}
        </p>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            mode === 'chat' ? '1fr' : '2fr 1fr',
          gap: 16,
          marginTop: 20,
        }}
      >
        {mode !== 'chat' && (
          <div>
            <div
              ref={videoRef}
              style={{
                minHeight:
                  mode === 'video' ? 430 : 180,
                background: '#111',
                borderRadius: 16,
                padding: 8,
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2,minmax(0,1fr))',
                gap: 8,
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={toggleMic}
                disabled={!connected}
              >
                {micOn
                  ? 'Mute mic'
                  : 'Unmute mic'}
              </button>

              {mode === 'video' && (
                <button
                  onClick={toggleCamera}
                  disabled={!connected}
                >
                  {cameraOn
                    ? 'Turn camera off'
                    : 'Turn camera on'}
                </button>
              )}

              <button
                onClick={leave}
                disabled={!connected}
              >
                Leave
              </button>
            </div>
          </div>
        )}

        <aside
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 500,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Private Chat
          </h2>

          <div
            style={{
              border: '1px solid #eee',
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <b>Files</b>

            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginTop: 8,
                flexWrap: 'wrap',
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadFile(file);
                  }

                  e.currentTarget.value = '';
                }}
              />

              <small>
                {uploading
                  ? 'Uploading...'
                  : 'Max 10 MB'}
              </small>
            </div>

            {files.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() =>
                      downloadFile(file.id)
                    }
                    style={{
                      textAlign: 'left',
                      background: 'none',
                      border: 0,
                      padding: 4,
                      cursor: 'pointer',
                    }}
                  >
                    📎 {file.file_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background:
                    message.sender_id ===
                    currentUserId
                      ? '#fff2d8'
                      : '#f4f4f4',
                }}
              >
                <b>
                  {message.sender_id ===
                  currentUserId
                    ? 'You'
                    : 'Participant'}
                </b>

                <div>{message.message}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10,
            }}
          >
            <input
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  send();
                }
              }}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: 10,
              }}
            />

            <button onClick={send}>
              Send
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}