import { useContext, useEffect, useState } from 'react'
import { Room } from '../Room';
import { User } from '../User';
import { GlobalContext } from '../GlobalContext';
import { useNavigate } from 'react-router-dom';



function RoomComponent(room : Room) {
  const navigate = useNavigate(); 

  return (
    <div style={{padding: '2rem', border: '1px solid black', borderRadius: '8px', cursor: 'pointer'}} 
      onClick={() => navigate(`/room/${room.id}`)}>
      <h2>{room.name}</h2>
    </div>
  )
}

function UserComponent(user: User) {
  return (
    <div style={{ border: '1px solid #cecece', borderRadius: '8px', padding: '12px'}}>
      <h3>{user.id}</h3>
    </div>
  )
}


function HomePage() {
  const [newRoomName, setNewRoomName] = useState('');
  const {users, rooms, socket} = useContext(GlobalContext);
  const navigate = useNavigate();

  const createRoom = () => {
    if (newRoomName.length === 0) {
      alert('방이름을 입력해주세요!');
      return;
    }
    socket?.emit('create-room', newRoomName);
  }

  socket?.on('room-created', (roomId: string) => {
    navigate(`/room/${roomId}`);
  });

  useEffect(() => {
    socket?.emit('exit-all-room')
  }, [socket]);

  return (
    <main style={{  width: '90%', height: '100%', display: 'flex', flexDirection: 'column', margin: 'auto'}}>
      <h1>WebRTC Example (id: {socket ? socket.id : 'socket.io 연결이 안됐어요  '})</h1>
      <div style={{display: 'flex'}}>
        <input style={{flexGrow: 1}} value={newRoomName} type="text" placeholder='방이름' onChange={(e) => setNewRoomName(e.target.value)}/>
        <button style={{padding: '0.6rem'}} onClick={createRoom}>create Room</button>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between'}}>
        <div aria-label='방 목록'>
          <h2>방 목록</h2>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {rooms.map((room) => <RoomComponent {...room} />)}
          </div>
        </div>


        <div aria-label='유저 목록'>
          <h2>유저 목록</h2>
          <div style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'column', minWidth: '300px', flexShrink: 0}}>
            {users.map((user) => <UserComponent key={user.id} {...user}/>)}
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage
