/* global makeSznSelectBundleScript */

import Vue from 'vue'

if (!Vue.config.ignoredElements.includes('szn-select')) {
  Vue.config.ignoredElements.push('szn-select')
}

const READY_EVENT = 'szn-select:ready'
const LOADER_URL_KEYS = [
  'package',
  'loader',
  'es3',
  'es2016',
  'bundle-elements.es3',
  'bundle-elements.es2016',
  'bundle-full.es3',
  'bundle-full.es2016',
  'bundle-full.ce',
]

const DEFAULT_LOADER_OPTIONS = {
  enable: true,
  useEmbeddedLoader: false,
  useAsyncLoading: true,
  urls: {
    package: 'https://unpkg.com/@jurca/szn-select@<VERSION>/',
  },
}

let sznSelectLoadingBegun = false

export default {
  props: {
    'name': {
      type: String,
    },
    'id': {
      type: String,
    },
    'multiple': {
      type: Boolean,
    },
    'disabled': {
      type: Boolean,
    },
    'aria-label': {
      type: String,
    },
    'loaderOptions': {
      type: Object,
      default() {
        return Object.assign({}, DEFAULT_LOADER_OPTIONS)
      },
      validator(value) {
        const booleanKeys = ['enable', 'useEmbeddedLoader', 'useAsyncLoading']
        for (const key of booleanKeys) {
          if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] !== 'boolean') {
            return false
          }
        }

        if (Object.prototype.hasOwnProperty.call(value, 'urls')) {
          for (const key of LOADER_URL_KEYS) {
            if (Object.prototype.hasOwnProperty.call(value.urls, key) && typeof value.urls[key] !== 'string') {
              return false
            }
          }

          if (!Object.keys(value.urls).every(key => LOADER_URL_KEYS.includes(key))) {
            return false
          }
        }

        return true
      },
    },
  },

  data() {
    return {
      sznSelectAttrs: {},
    }
  },

  render(h) {
    const rootAttrs = Object.assign({}, this.sznSelectAttrs)
    const selectAttributes = Object.assign({}, this.$props)
    selectAttributes['aria-label'] = selectAttributes.ariaLabel
    delete selectAttributes.ariaLabel

    return (
      h('szn-select', {attrs: rootAttrs, ref: 'root', on: {[READY_EVENT]: this.onSelectReady}}, [
        h('select', {attrs: selectAttributes, on: this.$listeners},
          this.$slots.default,
        ),
        h('span', {attrs: {'data-szn-select--ui': ''}}),
      ])
    )
  },

  mounted() {
    if (sznSelectLoadingBegun) {
      return
    }

    sznSelectLoadingBegun = true
    const {loaderOptions} = this
    if (loaderOptions.enable === false) {
      return
    }

    if (loaderOptions.useEmbeddedLoader) {
      const urlsConfiguration = loaderOptions.urls || DEFAULT_LOADER_OPTIONS.urls
      const bundleScript = loadSznSelect(urlsConfiguration, loaderOptions.useAsyncLoading !== false)
      document.head.appendChild(bundleScript)
      return
    }

    const loaderScript = document.createElement('script')
    loaderScript.async = loaderOptions.useAsyncLoading !== false

    const urls = loaderOptions.urls || {}
    const providedPackageUrl = urls.package || DEFAULT_LOADER_OPTIONS.urls.package
    const packageUrl = /\/$/.test(providedPackageUrl) ? providedPackageUrl : `${providedPackageUrl}/`

    loaderScript.setAttribute('data-szn-select--loader-urls--package', packageUrl)
    for (const urlOption of Object.keys(urls)) {
      loaderScript.setAttribute(`data-szn-select--loader-urls--${urlOption.replace('.', '-')}`, urls[urlOption])
    }

    loaderScript.src = urls.loader || `${packageUrl}loader.min.js`

    document.head.appendChild(loaderScript)
  },

  beforeDestroy() {
    // remove listener
  },

  methods: {
    onSelectReady(event) {
      this._handleAttributesChange(event.detail.attributes)
    },

    _handleAttributesChange(requestedAttributeUpdate) {
      const sznSelectAttrs = this._processAttributes(requestedAttributeUpdate)
      this.sznSelectAttrs = sznSelectAttrs
    },

    _processAttributes(attributesUpdate) {
      const currentAttributes = {}
      for (const attribute of Object.keys(attributesUpdate)) {
        if (attributesUpdate[attribute] !== null) { // attribute deleting is handled by React
          currentAttributes[attribute] = attributesUpdate[attribute]
        }
      }
      return currentAttributes
    },
  },
}

function loadSznSelect(urlConfiguration, useAsyncLoading) {
  // %{EMBEDDABLE_LOADER}%

  return makeSznSelectBundleScript(urlConfiguration, useAsyncLoading)
}
