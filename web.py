from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
assets = Environment(app)

try:
    # try to load local settings from settings.py
    app.config.from_object('settings')
except ImportError:
    pass  # no worries, CONTINUE!

# Bundle js assets
js = Bundle(
    'js/jquery-1.10.2.min.js',
    'sfapp/js/bootstrap.min.js',
    'js/modernizr.min.js',
    'sfapp/js/sfapp.js',
    'js/site.js',
    filters='rjsmin', output='gen/packed.js')
assets.register('js_all', js)


# @app.before_request

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
