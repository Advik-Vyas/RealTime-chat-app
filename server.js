const mongo = require('mongodb').MongoClient;
const client = require('socket.io')(4000).sockets;


//Connect to MongoDB
mongo.connect('mongodb://127.0.0.1/chatapp',function(err,db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    //connect to socket.io
    client.on('connection',function(socket){
        let chat = db.collection('chats');

        // create a function to send status
        sendStatus = function(s){
            socket.emit('status',s);
        }

        //Get chats from mongo collection

        chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if(err){
                throw err;
            }

            //Emit the messages
            socket.emit('output',res);
        });

        //Handle input events

        socket.on('input',function(data){
            let name = data.name;
            let message = data.message;

            //Check for name and message

            if (name == '' || message == ''){
                //Send error status
                sendStatus('Please enter a name and message');
            }
            else{
                //Insert into DB
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    //send status object

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        //Handle Clear
        socket.on('clear', function(){
            //Remove all chats from collection
            chat.remove({},function(){
                //Emit Cleared
                socket.emit('cleared');
            });
        });
    });
});

