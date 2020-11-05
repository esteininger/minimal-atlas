from flask import Flask, render_template
import os

app = Flask(__name__)

app_config = {
    'ROOT_PATH': os.path.dirname(os.path.abspath(__file__))
}

# # app settings
# app.static_folder = app_config['ROOT_PATH'] + '/Views/static'
# app.template_folder = app_config['ROOT_PATH'].split('Controllers')[0] + '/Views/templates'

@app.route('/')
def home():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
