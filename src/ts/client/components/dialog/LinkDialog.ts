/**
 * @fileoverview The dialog to edit links
 *
 */
import { Constants } from '../../../constants'
import { LinkData } from '../../element-store/types'
import {SilexNotification} from '../Notification'
import { getPages } from '../../page-store/index'

export const LINK_ATTRIBUTES =
    ['href', 'rel', 'target', 'type', 'title', 'download']
const DEFAULT_LINK_DATA = {
  href: '',
  target: '',
  title: '',
  rel: '',
  type: '',
  download: '',
}

///////////////////
// API for the outside world
let instance: LinkDialog
function initLinkDialog() {
  instance = instance || new LinkDialog()
  return instance
}
export function openLinkDialog(options: {data: LinkData, cbk: (p1: LinkData) => any}) {
  initLinkDialog()
  return instance.open(options.data, options.cbk)
}

/**
 * TODO: make this only methods and write tests
 */
class LinkDialog {
  constructor() {}

  open(linkDataArg: LinkData, cbk: (p1: LinkData) => any) {
    // default values for new link
    const linkData = Object.assign({}, DEFAULT_LINK_DATA, linkDataArg || {})

    // external link data
    const isExternal = !linkData.href.startsWith(Constants.PAGE_NAME_PREFIX)
    SilexNotification.prompt(`
      Link editor <a class="link-editor-help-button fa fa-question-circle" target="_blank" href="https://github.com/silexlabs/Silex/wiki/Editor-UI#link-editor"> Help</a>
    `, 'unused', 'unused', 'unused', (accept, unused) => {
      if (accept) {
        // get new values
        const newData: LinkData = LINK_ATTRIBUTES.reduce((acc, attr) => {
          const el = dialogBody.querySelector('.' + attr) as HTMLInputElement
          if (!el) {
            console.error('could not get data from for attribute', attr)
          } else {
            acc[attr] = el.value
          }
          return acc
        }, {})

        // internal link info
        const newIsExternal = (dialogBody.querySelector('#link-editor-external') as HTMLInputElement).checked
        const page = (dialogBody.querySelector('.page') as HTMLInputElement).value
        const options: LinkData = {href: newIsExternal ? newData.href : page}
        if (newData.target !== '') {
          options.target = newData.target
        }
        if (newData.rel !== '') {
          options.rel = newData.rel
        }
        if (newData.title !== '') {
          options.title = newData.title
        }
        if (newData.type !== '') {
          options.type = newData.type
        }
        if (newData.download !== '') {
          options.download = newData.download
        }
        cbk(options)
      } else {
        cbk(linkDataArg)
      }
    })

    // add a remove link button
    const fragmentButtons = document.createElement('fragment')
    fragmentButtons.innerHTML = `
      <button class="alertify-button alertify-button-cancel alertify-button-remove">remove link</button>
    `;
    (fragmentButtons.querySelector('.alertify-button-remove') as HTMLElement).onclick = (e) => {
      SilexNotification.close()
      cbk(null)
    }
    SilexNotification.addButton(fragmentButtons)

    // add info about the link
    const dialogBody = document.createElement('div')
    dialogBody.insertAdjacentHTML('afterbegin', this.getDialogHtml({isExternal, linkData}))
    Array.from(dialogBody.querySelectorAll('.link-editor-tab-label'))
    .forEach((el: HTMLElement) => {
      el.onclick = (_) => {
      Array
      .from(dialogBody.querySelectorAll(
        '.link-editor-tab-label.checked'))
        .forEach((selected) => selected.classList.remove('checked'))
      el.classList.add('checked')
      }
    })
    SilexNotification.setContent(dialogBody)
  }

  getDialogHtml({isExternal, linkData}) {
    return `
      <section class="link-editor">
        <div class="labels">
          <label for="link-editor-external" title="External Link" class="link-editor-tab-label first-button fa fa-lg fa-link${isExternal ? ' checked ' : ''}"></label>
          <label for="link-editor-internal" title="Link to a page" class="link-editor-tab-label last-button fa fa-lg fa-file"${isExternal ? '' : ' checked '}></label>
          <div class="space"></div>
        </div>
        <div class="link-editor-body">
        <input autocomplete="nope" id="link-editor-external" class="link-editor-radio" type="radio" name="link-editor-tab-group"${isExternal ? ' checked ' : ''}/>
        <div class="link-editor-tab link-editor-tab-external">
          <div class="link-editor-tab-container">
            <label for="link-editor-href">External link</label>
            <div class="flex">
              <input autocomplete="nope" spellcheck="false" id="link-editor-href" class="big alertify-text href tabbed" type="url" value="${isExternal ? linkData.href : ''}">
              <select autocomplete="nope" id="link-editor-target" class="alertify-text target">
                <option${linkData.target === '' ? ' selected ' : ''} value=""></option>
                <option${linkData.target === '_self' ? ' selected ' : ''} value="_self">_self</option>
                <option${linkData.target === '_blank' ? ' selected ' : ''} value="_blank">_blank</option>
                <option${linkData.target === '_parent' ? ' selected ' : ''} value="_parent">_parent</option>
                <option${linkData.target === '_top' ? ' selected ' : ''} value="_top">_top</option>
              </select>
            </div>
          </div>
        </div>
        <input autocomplete="nope" id="link-editor-internal" class="link-editor-radio" type="radio" name="link-editor-tab-group"${!isExternal ? ' checked ' : ''}/>
        <div class="link-editor-tab link-editor-tab-internal">
          <div class="link-editor-tab-container">
            <label for="link-editor-page">Page</label>
            <select autocomplete="nope" class="tabbed alertify-text page big" id="link-editor-page">
              <option value=""${isExternal ? ' selected ' : ''}></option>
              ${getPages().map((page) => `<option value="${Constants.PAGE_NAME_PREFIX + page.id}"${        !isExternal && Constants.PAGE_NAME_PREFIX + page.id === linkData.href ? ' selected ' : ''} >
                ${page.displayName}
              </option>`)}
            </select>
          </div>
        </div>
        <div class="link-editor-tab-container">
          <div class="link-editor-2col">
            <label for="link-editor-title">Title</label>
            <input autocomplete="nope" id="link-editor-title" class="alertify-text title big" type="text" value="${linkData.title}">
          </div>
        </div>
        <hr>
        <div class="link-editor-advanced-container">
          <input autocomplete="nope" id="link-editor-show-advanced" type="checkbox">
          <label for="link-editor-show-advanced">Advanced params</label>
          <div class="link-editor-advanced">
            <label for="link-editor-rel">The "rel" attribute. Describes the relationship between the current document and the destination.</label>
            <input autocomplete="nope" id="link-editor-rel" class="alertify-text rel" type="text" value="${linkData.rel}">
            <label for="link-editor-type">The "type" attribute. Specifies the MIME type of the linked resource.</label>
            <input autocomplete="nope" id="link-editor-type" class="alertify-text type" type="text" value="${linkData.type}">
            <label for="link-editor-download">The "download" attribute. Indicates that the link is to be used for downloading a resource (such as a file). The author can specify a default file name by providing a value.</label>
            <input autocomplete="nope" id="link-editor-download" class="alertify-text download" type="text" value="${linkData.download}">
          </div>
        </div>
        </div>
      </section>
    `
  }
}
