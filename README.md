# webRTC-challenge

I divided the challenge in major steps:

1. get local media
2. create a peerconnection
3. get access to SDP (console.log)
4. connect to another peer trough the STUN server
5. send SDP over the STUN server to the other peer
6. connect trough the SDP somehow
7. send local media
8. receive the peer local media
9. sucess !

4 - I believe this is working already, altough the other user
is me.

5 - I'm looking for solutions for this, so far socket.io sounds
like a good idea, but also heard about SIP ?

6 - I'm still in the void on this one

7 - sounds straightforward

8 - sounds straightforward

In regards to the healthbar, currently it's being "damaged" by
the local sound, but as soon as I retrieve the remote media
I just need to call the function somewhere else and pass
the remote stream instead of the local stream to the function.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
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
