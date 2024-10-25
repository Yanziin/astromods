from flask import Flask
app = Flask(__name__)
import random
import os

@app.route('/')
def hello_world():
    if 'PORT' in os.environ:
        return 'tem porta'
    return 'no port'
