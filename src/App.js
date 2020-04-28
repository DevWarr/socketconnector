import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

function App() {
	const [form, setForm] = React.useState({ message: '', data: '' });
	const [socketLink, setSocketLink] = React.useState('http://localhost:5000');
	const [socket, setSocket] = React.useState(null);

	const [socketoptions, setSocketOptions] = React.useState(['test', 'init', 'debug/reset', 'move']);

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

	const testServer = (e) => {
		e.preventDefault();
		console.log(socketLink);
		axios.get(socketLink).then(console.log).catch(console.error);
	};

	const socketOptions = (e) => {
		e.preventDefault();
		console.log(socketLink);
		axios
			.get(socketLink + '/socketoptions')
			.then((res) => setSocketOptions(res.data))
			.catch(console.error);
	};

	const connectSocket = (e) => {
		e.preventDefault();
		console.log(socketLink);
		try {
			const socket = io.connect(socketLink, { withCredentials: false });
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
					<div class="http">
						<button onClick={testServer}>Test the server's "GET /"</button>
						<button onClick={socketOptions}>Retreive socket options</button>
					</div>
					<button onClick={connectSocket}>Connect to server via socket</button>
				</div>
			</form>

			<form className="data" onSubmit={sendSocket}>
				<label htmlFor="message">Message</label>
				<input
					id="message"
					name="message"
					list="message-options"
					value={form.message}
					onChange={changeHandler}
				/>
				<datalist id="message-options">
					{socketoptions.map((opt, i) => (
						<option key={i}>{opt}</option>
					))}
				</datalist>
				<label htmlFor="data">Data</label>
				<textarea id="data" name="data" value={form.data} onChange={changeHandler} />
				<button type="submit">Send Data</button>
			</form>
		</div>
	);
}

export default App;
