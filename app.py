from flask import Flask
from flask.views import View

application = Flask(__name__)

class Application(View):
    def dispatch_request(self):
        return 'Hello, World!'

application.add_url_rule('/', view_func=Application.as_view('hello'))

if __name__ == '__main__':
    application.run()