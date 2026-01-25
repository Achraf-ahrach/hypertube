import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Box, Typography } from '@mui/material';
import { api, API_URL } from './api/axiosConfig';

interface VideoPlayerProps {
    movieId: number;
}

interface Subtitle {
    language: string;
    language_name: string;
    file_path: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movieId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Subtitles
    useEffect(() => {
        api.get(`/subtitles/?movie_id=${movieId}&language=en`)
           .then(res => setSubtitles(res.data))
           .catch(err => console.error("Subtitle load failed", err));
    }, [movieId]);

    // 2. Initialize HLS
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const hlsUrl = `${API_URL}/video/${movieId}/playlist/`;

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                // FIX: Force start from 0
                startPosition: 0,
                // FIX: Don't jump to live edge
                liveSyncDurationCount: 0, 
                // Optional: Increase buffer for smoother start
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    setError("Playback Error: " + data.type);
                    hls.destroy();
                }
            });

            return () => hls.destroy();
        } 
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native support (Safari)
            video.src = hlsUrl;
        } 
        else {
            setError("Your browser does not support HLS.");
        }
    }, [movieId]);

    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ width: '100%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
            <video 
                ref={videoRef} 
                controls 
                style={{ width: '100%', display: 'block' }}
                crossOrigin="anonymous"
            >
                {subtitles.map((sub) => (
                    <track
                        key={sub.language}
                        kind="subtitles"
                        label={sub.language_name}
                        srcLang={sub.language}
                        // Ensure path is relative to Nginx root (/media/)
                        src={sub.file_path.startsWith('http') ? sub.file_path : `/media/${sub.file_path}`}
                        default={sub.language === 'en'}
                    />
                ))}
            </video>
        </Box>
    );
};

export default VideoPlayer;