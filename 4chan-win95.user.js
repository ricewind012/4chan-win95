// ==UserScript==
// @name        W9x for 4chan stuff
// @description Helper userscript
// @version     0.4
// @author      (You)
//
// @namespace   https://github.com/2641a40fd44383320adde4b027a1d0b03bd550/4chan-win95
// @homepageURL https://github.com/2641a40fd44383320adde4b027a1d0b03bd550/4chan-win95
// @supportURL  https://github.com/2641a40fd44383320adde4b027a1d0b03bd550/4chan-win95/issues
// @downloadURL https://github.com/2641a40fd44383320adde4b027a1d0b03bd550/4chan-win95/raw/master/4chan-win95.user.js
// @updateURL   https://github.com/2641a40fd44383320adde4b027a1d0b03bd550/4chan-win95/raw/master/4chan-win95.user.js
//
// @match       *://boards.4channel.org/*
// @match       *://boards.4chan.org/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

const $ = (s, p = document) => p.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const str2id = s => s.replace(/\W+/g, '-').toLowerCase()

const make = (tag, attrs, parent, prepend = false) => {
	let el = document.createElement(tag)

	for (let k in attrs)
		el.setAttribute(k, attrs[k])

	if (prepend)
		parent.prepend(el)
	else
		parent.appendChild(el)

	return el
}

document.documentElement.classList.add('win95-userscript')

/**
 * Content
**/
// Move the content to a wrapper in body to move the scrollbar
try {
	let dialogs = $$('body > .dialog')

	dialogs.forEach(e => document.body.removeChild(e))
	document.body.innerHTML = `<main id="content">${document.body.innerHTML}</main>`
	dialogs.forEach(e => document.body.prepend(e))
} catch (e) {
	location.reload()
}

document.addEventListener('4chanXInitFinished', () => {
	// Menu bar
	let tabs = {
		'Main': [
			'Miscellaneous',
			'Linkification',
			'Filtering',
			'Images & Videos',
			'Menu',
			'Monitoring',
			'Posting & Captchas',
			'Quote Links'
		],

		'Filter': [
			'Guide',
			'General',
			'Post Number',
			'Name',
			'Unique ID',
			'Tripcode',
			'Capcode',
			'Pass Date',
			'Email',
			'Subject',
			'Comment',
			'Flag',
			'Filename',
			'Image Dimensions',
			'Filesize',
			'Image MD5'
		],

		'Sauce': [ ],

		'Advanced': [
			'Archives',
			'External Catalog',
			'Override 4chan Image Host',
			'Captcha Language',
			'Custom Board Navigation',
			'Time Formatting',
			'Quote Backlinks Formatting',
			'Default Pasted Content Filename',
			'File Info Formatting',
			'Quick Reply Personas',
			'Unread Favicon',
			'Thread Updater',
			'Custom Cooldown Time',
			'Custom CSS',
			'JavaScript Whitelist',
			'Known Banners'
		],

		'Keybinds': [ ]
	}

	let header = $('#header-bar')
	let menubar = make('span', { id: 'menubar' }, header, true)

	for (let k in tabs) {
		let a = tabs[k]

		let tabname = str2id(k)
		let tab = make('span', { id: `menubar-${tabname}`, class: 'shortcut' }, menubar)
		let tablink = make('a', { title: k, href: 'javascript:;' }, tab)
		tablink.textContent = k

		tab.addEventListener('click', () => {
			let tabmenu = $('#menu', tab)

			if (!a.length) {
				document.dispatchEvent(new CustomEvent('OpenSettings', {
					bubbles: true,
					detail: k
				}))
				return
			}
			if (tabmenu) {
				tab.removeChild(tabmenu)
				return
			}

			let menu = make('div', { id: 'menu', class: 'dialog' }, tab)

			for (let i = 0; i < a.length; i++) {
				let menulink = make('a', {
					id: `menu-${str2id(a[i])}`,
					class: 'entry',
					href: 'javascript:;'
				}, menu)
				menulink.textContent = a[i]

				menulink.addEventListener('click', () => {
					document.dispatchEvent(new CustomEvent('OpenSettings', {
						bubbles: true,
						detail: k
					}))

					switch (tabname) {
						case 'main':
						case 'advanced':
							$(`fieldset:nth-child(${i + (tabname === 'main' ? 2 : 1)})`).scrollIntoView()
							break

						case 'filter':
							let fselect = $('.section-filter > select')

							fselect.selectedIndex = i
							fselect.dispatchEvent(new Event('change'))
							break
					}
				})
			}
		})
	}

	// Check if the page is broken, and reload, if so
	if ($('body > #bottom, body > form'))
		location.reload()
})

