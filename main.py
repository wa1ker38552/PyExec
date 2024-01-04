from flask_socketio import SocketIO
from flask import render_template
from threading import Thread
from flask import request
from flask import Flask
import subprocess
import logging
import random
import json
import os


log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
processes = {}


def stream_output(id):
  process = subprocess.Popen(f"python -u {id}.py",
                             stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT,
                             universal_newlines=True,
                             shell=True,
                             bufsize=1)
  processes[str(id)] = process 

  for output in iter(process.stdout.readline, ''):
    # print(output.strip(), flush=True)
    socket.emit(str(id), output.strip())

  remaining_output = process.communicate()[0]
  if remaining_output:
    # print(remaining_output.strip())
    socket.emit(str(id), remaining_output.strip())

  socket.emit(str(id)+"_finished")
  os.remove(f'{id}.py')
  del processes[str(id)]

app = Flask(__name__)
socket = SocketIO(app)

@app.route('/')
def app_index():
  return render_template('index.html')

@app.route('/execute', methods=['POST'])
def api_execute():
  data = json.loads(request.data.decode('utf-8'))
  task_id = random.randint(1, 9999999999)
  with open(f'{task_id}.py', 'w') as file:
    file.write(data['script'])
  Thread(target=lambda: stream_output(task_id)).start()
  return {'id': task_id}

@socket.on('terminate')
def terminate_script(id):
  id = str(id)
  if id in processes:
    processes[id].terminate()

socket.run()
