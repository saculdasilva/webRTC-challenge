# webRTC-challenge

#readme
- this project was built and tested only on local
- please change the address on main.js (192.168.1.5:3000) to the signaling server address.
- you might need to use flags on chrome on a second machine for getUserMedia to work. (see parent readme)

#todo:
```
- video filter that reacts to audio
- win/lose
- improve the buttons behaviour (bugs)
- make a much better UI with a decent design
```

I divided the challenge in major steps:

1. Basic Interface
2. get local media
3. make a healthbar that reacts to sound from webRTC media
4. create a peerconnection
5. get access to local SDP (console.log)
6. create a simple socket server
7. offer the SDP and media to another peer trough the socket server
8. answer the offer with own sdp and media
9. bind the answer to video and healthbar elements
10. deal with the ice candidates
11. bind the remote stream into the healthbar and video elements

Difficulties found:

ICE is tricky and sometimes hard to debug related problems.
The back and forth signaling can get overwhelming and hard to keep track.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
