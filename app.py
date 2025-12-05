from flask import Flask, send_file, send_from_directory

application = Flask(__name__, static_folder='utils/frontend/static', template_folder='utils/frontend/templates')

@application.route('/')
def index():
    return send_file('utils/frontend/templates/index.html')

@application.route('/parts/<path:filename>')
def serve_parts(filename):
    return send_from_directory('utils/frontend/templates/parts', filename)

@application.route('/primary/<path:filename>')
def serve_primary(filename):
    return send_from_directory('utils/frontend/templates/primary', filename)

if __name__ == '__main__':
    application.run(debug=True)