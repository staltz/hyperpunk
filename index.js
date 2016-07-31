const noise1Png = require('./noise1');
const noise2Png = require('./noise2');
const noise3Png = require('./noise3');
const HUE_SHIFT_INTENSITY = 4;
const BRIGHT_GREEN = '#28FC91';
const DARK_GREEN = '#0F2218';
const TEXT_GREEN = '51, 255, 0';

exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    foregroundColor: BRIGHT_GREEN,
    backgroundColor: DARK_GREEN,
    borderColor: BRIGHT_GREEN,
    cursorColor: '#40FFFF',
  });
}

exports.decorateHyperTerm = (HyperTerm, { React, notify }) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = { noise: 0 };
      this._flip = this._flip.bind(this);
      this._intervalID = null;
    }

    _flip () {
      this.setState({ noise: (this.state.noise + 1) % 3 });
    }

    componentWillMount() {
      this._intervalID = setInterval(this._flip, 120);
    }

    render() {
      const noisePng = [noise1Png, noise2Png, noise3Png][this.state.noise];
      const noiseCss = `
        background-image: ${noisePng};
        background-size: 100px 100px;
      `;
      const textShadow = generateTextShadow();

      const overridenProps = {
        backgroundColor: 'black',
        customCSS: `
          ${this.props.customCSS || ''}
          body {
            ${noiseCss}
          }
          .tabs_nav {
            ${noiseCss}
          }
          .tabs_nav .tabs_title {
            color: rgb(${TEXT_GREEN}) !important;
            font-weight: bold !important;
            ${textShadow}
          }
          .tabs_list {
            background-color: ${DARK_GREEN} !important;
            background-image: none !important;
          }
          .tab_tab {
            border-width: 0px !important;
            border-right: 0px solid transparent !important;
            border-left: 1px solid ${BRIGHT_GREEN} !important;
          }
          .tab_tab:not(.tab_active) {
            color: rgba(${TEXT_GREEN}, 0.7);
          }
          .tab_tab.tab_active {
            height: calc(100% + 1px);
            ${noiseCss}
            border-left: 0px solid ${BRIGHT_GREEN} !important;
            ${textShadow}
            font-weight: bold;
            color: rgb(${TEXT_GREEN});
          }
          /* Hide hardcoded black bottom border */
          .tab_active:before {
            border-bottom: none !important;
            border-left: 1px solid transparent !important;
          }
        `,
      };
      return React.createElement(HyperTerm, Object.assign({}, this.props, overridenProps));
    }

    componentWillUnmount() {
      clearInterval(this._intervalID);
    }
  }
}

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._drawFrame = this._drawFrame.bind(this);
      this._onTerminal = this._onTerminal.bind(this);
      this._injectStyles = this._injectStyles.bind(this);
      this._div = null;
      this._body = null;
      this._globalStyle = null;
      this._term = null;
      this._intervalID = null;
    }

    _onTerminal (term) {
      if (this.props.onTerminal) this.props.onTerminal(term);
      this._div = term.div_;
      this._term = term;
      this._body = term.cursorNode_.parentElement;
      this._window = term.document_.defaultView;
      this._injectStyles();
      this._intervalID = setInterval(() => {
        this._window.requestAnimationFrame(this._drawFrame);
      }, 80);
    }

    _injectStyles() {
      if (this._term) {
        this._term.prefs_.set('background-color', 'transparent');
        this._term.prefs_.set('background-image', 'none');
      }
      this._globalStyle = document.createElement('style');
      this._globalStyle.setAttribute('type', 'text/css');
      this._term.scrollPort_.document_.body.appendChild(this._globalStyle);
    }

    _drawFrame () {
      this._globalStyle.innerHTML = `
        x-screen {
          ${generateTextShadow()}
        }
      `;
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

    componentWillUnmount () {
      clearInterval(this._intervalID);
    }
  }
};

function generateTextShadow() {
  let x = -1 + 2 * Math.random();
  x = x * x;
  const intensity = HUE_SHIFT_INTENSITY * x;
  return `text-shadow: ${intensity}px 0 1px rgba(0,30,255,0.5), ${-intensity}px 0 1px rgba(255,0,80,0.3), 0 0 3px !important;`
}
