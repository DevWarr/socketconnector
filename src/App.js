import React from 'react';
import io from 'socket.io-client';
import axios from 'axios'
import './App.css';

function App() {
	const [form, setForm] = React.useState({ message: '', data: '' });
	const [socketLink, setSocketLink] = React.useState('http://localhost:5000');
	const [socket, setSocket] = React.useState(null);

	React.useEffect(() => {
		if (socket) {
			console.log(socket);
			console.log('Socket connected!');

			const onevent = socket.onevent;
			socket.onevent = function (packet) {
				const args = packet.data || [];
				onevent.call(this, packet); // original call
				packet.data = ['*'].concat(args);
				onevent.call(this, packet); // additional call to catch-all
			};

			socket.on('*', console.log);
		}
	}, [socket]);

	const changeHandler = (e) => {
		setForm({
			...form,
			[e.target.name]: e.target.value,
		});
	};

	const testServer = e => {
		e.preventDefault();
		console.log(socketLink);
		axios.get(socketLink)
			.then(console.log)
			.catch(console.error)
	};

	const connectSocket = (e) => {
		e.preventDefault();
		console.log(socketLink);
		try {
			const socket = io.connect(socketLink, {withCredentials: false});
			setSocket(socket);
		} catch (e) {
			console.error(e);
		}
	};

	const sendSocket = (e) => {
		e.preventDefault();
		if (!socket || !socket.emit) {
			console.error("There's no socket connected!");
		} else {
			try {
				if (form.data.length) {
					const data = JSON.parse(form.data);
					socket.emit(form.message, data);
				} else socket.emit(form.message);
			} catch (e) {
				console.error(e);
			}
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Socket Connector</h1>
			</header>

			<div className="info">
				<h3>How to use</h3>
				<p>
					<span className="bold">First:</span>
					<br />
					Add your server's url to the socket link input. Once connected, you will see a message in the
					console that you are connected.
				</p>
				<p>
					<span className="bold">Second:</span>
					<br />
					Add a message name, and data <span className="bold">formatted in JSON</span> to send via socket.
				</p>
				<p>You will see your response logged in the console.</p>
			</div>

			<form className="socket">
				<label htmlFor="socketlink">SocketLink</label>
				<input
					id="socketlink"
					name="socketlink"
					value={socketLink}
					onChange={(e) => setSocketLink(e.target.value)}
				/>
				<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
					<button onClick={testServer}>Test the server's "GET /"</button>
					<button onClick={connectSocket}>Connect to server via socket</button>
				</div>
			</form>

			<form className="data">
				<label htmlFor="message">Message</label>
				<input id="message" name="message" value={form.message} onChange={changeHandler} />
				<label htmlFor="data">Data</label>
				<textarea id="data" name="data" value={form.data} onChange={changeHandler} />
				<button onClick={sendSocket}>Send Data</button>
			</form>
		</div>
	);
}

export default App;
