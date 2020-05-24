# webRTC-challenge

I divided the challenge in major steps:

1. Basic Interface - done
2. get local media - done
3. make a healthbar that reacts to sound from webRTC media - done
4. create a peerconnection - done
5. get access to SDP (console.log) - done
6. connect to another peer trough the STUN server - in progress
7. send SDP over the STUN server to the other peer - in progress
8. connect trough the SDP somehow - to do
9. send local media - to do
10. receive the remote peer local media - done?
11. sucess ! - to do

6 - I believe this is working already, altough the other peer
is me.

7 - I'm looking for solutions for this, so far socket.io sounds
like a good idea, but also heard about SIP ?

8 - I'm still in the void on this one

9 - sounds straightforward

10 - sounds straightforward

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
