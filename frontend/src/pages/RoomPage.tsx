import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../GlobalContext";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../User";


interface PeerVideoInformation {
    video: HTMLVideoElement;
    peerConnection: RTCPeerConnection;
    makingOffer: boolean;
}

interface PeerVideos {
    [id: string] : PeerVideoInformation; 
}

type IceCandidateType = 'local' | 'remote';


interface IceCandidateInformation {
    candidate: RTCIceCandidate;
    target: string; 
}

interface SdpOfferInformation {
    offer: RTCSessionDescription; 
    target: string;
}

interface SdpAnswerInformation {
    answer: RTCSessionDescription; 
    target: string;
}

function RoomPage() {
    const navigate = useNavigate();

    const [camEnabled, setCamEnabled] = useState(true); 
    const [micEnabled, setMicEnabled] = useState(true); 
    const [userMedia, setUserMedia] = useState<MediaStream | null>(null);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);

    const {rooms, socket} = useContext(GlobalContext);
    const {roomId} = useParams();
    const room = rooms.find((room) => (room.id === roomId));

    const videoRefs = useRef<PeerVideos>({});
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const servers = {
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    };
    useEffect(() => {
        setOtherUsers(room?.users.filter(user => user.id !== socket?.id) ?? []);

        if (userMedia) {
            Object.keys(videoRefs.current).forEach((id) => {
                userMedia.getTracks().forEach(async (track) => {
                    if (videoRefs.current[id].peerConnection.getSenders().find(sender => sender.track === track)) {
                        return;
                    }
                    videoRefs.current[id].peerConnection.addTrack(track, userMedia);
                });
            }); 
        }
        
        (async()=>{
            if (room?.users.find(user => user.id === socket?.id)) {
                // oldbie here 
                console.log('oldbie here')
                return;
            } 
            else {
                // newbie here
                console.log('newbie here')
                socket?.emit('join-room', roomId);        
            }
        })();
    }, [room?.users, socket?.id, roomId, socket, userMedia]);
    

    // FIXME: make it change my video stream, when camEnabled or micEnabled changes
    useEffect(() => {
        (async () => {
            if (!socket?.id) return;
            let userMedia: MediaStream | null = null;
            if (camEnabled || micEnabled) {     
                userMedia = await navigator.mediaDevices.getUserMedia({video: camEnabled, audio: micEnabled});
                setUserMedia(userMedia);
            }
            if (myVideoRef.current && myVideoRef.current.srcObject !== userMedia) {
                myVideoRef.current.srcObject = userMedia;
            }
        })();
    }, [camEnabled, micEnabled, socket?.id]); 

    useEffect(() => {
        if (!socket) return;
        socket.on('ice-candidate', async ({candidate, target}: IceCandidateInformation) => {
            await videoRefs.current[target].peerConnection.addIceCandidate(candidate);
        });

        socket.on('offer', async ({offer, target}: SdpOfferInformation) => {
            
            // receive offer
            await videoRefs.current[target].peerConnection.setRemoteDescription(offer);
            await videoRefs.current[target].peerConnection.setLocalDescription();
            socket.emit('answer', {answer: videoRefs.current[target].peerConnection.localDescription, target});
        });

        socket.on('answer', async ({answer, target}: SdpAnswerInformation) => {
            await videoRefs.current[target].peerConnection.setRemoteDescription(answer);
        });
    }, [socket]); 


    if (!room) {
        return (
            <>
                <h1>방이 없음 다시 홈으로 ㄱㄱ</h1>
                <button onClick={() => navigate('/')}>홈으로</button>
            </>
        )
    }


    return (
        <div style={{margin: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>{room.name} 방에 오신걸 환영해요</h1>

                <div style={{ margin: '16px'}}>
                    <div>설정을 바꾸려면 눌러서 토글하세요</div>
                    <div style={{cursor: 'pointer'}} onClick={ () => setCamEnabled(cam => !cam) }>카메라 현재 상태: {camEnabled ? 'On' : 'Off'}</div>
                    <div style={{cursor: 'pointer'}} onClick={ () => setMicEnabled(mic => !mic) }>마이크 현재 상태: {micEnabled ? 'On' : 'Off'}</div>
                </div>
            </div>
            <button onClick={() => navigate('/')}>홈으로</button>
            <hr />
            <div>
                <h2>참여자 목록이에요 (총, {room.users.length} 명이 있어요)</h2>

                <ul style={{display: 'flex', flexWrap: 'wrap'}}>
                    <li  style={{ border: '1px solid black', margin: '12px', borderRadius: '12px', listStyle: 'none'}}>
                            <h3>내 비디오에요</h3>
                            <video width={640} height={480} ref={myVideoRef} autoPlay></video>
                    </li>
                    {socket && otherUsers.map((otherUser) => (
                        <li key={otherUser.id} style={{ border: '1px solid black', margin: '12px', borderRadius: '12px', listStyle: 'none'}}>
                            <h3>{otherUser.id} 님의 비디오에요</h3>
                            <video width={640} height={480} ref={ref => { 
                                if (ref && !videoRefs.current[otherUser.id]) { 
                                    const peerConnection = new RTCPeerConnection(servers);
                                    videoRefs.current[otherUser.id] = { video: ref, peerConnection, makingOffer: false };                            
                                    peerConnection.ontrack = ({streams}) => {
                                        console.log('on track');
                                        videoRefs.current[otherUser.id].video.srcObject = streams[0];
                                    }

                                    peerConnection.onicecandidate = ({candidate}) => {
                                        console.log('ice candidate');
                                        socket.emit('ice-candidate', {candidate, target: otherUser.id});
                                    }

                                    peerConnection.onnegotiationneeded = async () => {
                                        console.log('negotiation needed');
                                        try {
                                            videoRefs.current[otherUser.id].makingOffer = true;
                                            await peerConnection.setLocalDescription();
                                            socket.emit('offer', {offer: peerConnection.localDescription, target: otherUser.id});
                                        } catch(e) {
                                            console.error(e);
                                        } finally {
                                            videoRefs.current[otherUser.id].makingOffer = false;
                                        }
                                    }
                                }
                            }} autoPlay></video>
                        </li>)
                    )}
                </ul>
            </div>

        </div>
    )
}

export default RoomPage