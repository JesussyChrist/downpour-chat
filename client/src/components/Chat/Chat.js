import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainContext } from '../../contexts/mainContext'
import { SocketContext } from '../../contexts/socketContext'
import ScrollToBottom from 'react-scroll-to-bottom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Chat.css'
import { FiLogOut } from 'react-icons/fi'
import { RiSendPlaneFill } from 'react-icons/ri'

const Chat = () => {
    const { name, users, room, setName, setRoom } = useContext(MainContext)
    const socket = useContext(SocketContext)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const navigate = useNavigate()

    window.onpopstate = e => logout()
    //Checks to see if there's a user present
    useEffect(() => { if (!name) return navigate('/') }, [navigate, name])


    useEffect(() => {
        socket.on("message", msg => {
            setMessages(messages => [...messages, msg]);
        })

        socket.on("notification", notif => {
            toast.success(notif?.title, {
                toastId: "success",
                position: "top-center",
                autoClose: 3000,
                theme: "dark"
            })
        })
    }, [socket, toast])


    const handleSendMessage = () => {
        socket.emit('sendMessage', message, () => setMessage(''))
        setMessage('')
    }

    const logout = () => {
        setName(''); setRoom('');
        navigate('/')
        navigate(0)
    }

    return (
        <div className='room'>
            <div className='heading'>
                <div>
                    {users && users.map(user => {
                        return (
                            <div key={user.id}>
                                <div>{user.name}</div>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <div> {room.slice(0, 1).toUpperCase() + room.slice(1)}</div>
                    <div>{name}</div>
                </div>
                <FiLogOut onClick={logout} cursor='pointer'/>
            </div>
            <ScrollToBottom className='messages' debug={false} initialScrollBehavior='smooth'>
                {messages.length > 0 ?
                    messages.map((msg, i) =>
                    (<div key={i} className={`message ${msg.user === name ? "my-message" : ""}`}>
                        <h4>{msg.user}</h4>
                        <h3>{msg.text}</h3>
                    </div>)
                    )
                    :
                    <div>
                        <h2>No messages</h2>
                    </div>
                }
            </ScrollToBottom>
            <div className='form'>
                <input type="text" placeholder='Enter Message' value={message} onChange={e => setMessage(e.target.value)} />
                <RiSendPlaneFill onClick={handleSendMessage} disabled={message === '' ? true : false} />
            </div>
        </div>
    )
}

export default Chat
