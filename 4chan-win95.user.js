// ==UserScript==
// @name        W9x for 4chan stuff
// @description Helper userscript
// @version     0.3
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

const header = $('#header-bar')

document.documentElement.classList.add('win95-userscript')

/**
 * Content
**/
// Move dialogs to body to move the scrollbar below the header
// The delay lets the catalog load
// TODO: kills post preview
setTimeout(() => {
	let dialogs = $$('body > .dialog')

	dialogs.forEach(e => document.body.removeChild(e))
	document.body.innerHTML = `<main id="content">${document.body.innerHTML}</main>`
	document.body.style = 'padding: 0; margin: 0; position: fixed; width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;'
	document.documentElement.style = 'height: 100%;'
	header.style = 'position: sticky; top: 0;'
	dialogs.forEach(e => document.body.prepend(e))
}, /\/\w+\/$/.test(location.href) ? 1000 : 0)

// Menu bar
const tabs = {
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

	// TODO: God knows why changing select's selectedIndex does not work
	'Filter': [
		/*
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
		*/
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

let menubar = make('span', { id: 'menubar' }, header, true)

for (let k in tabs) {
	let a = tabs[k]

	let tabname = str2id(k)
	let tab = make('span', { id: `menubar-${tabname}`, class: 'shortcut' }, menubar)
	let tablink = make('a', { title: k }, tab)
	tablink.textContent = k

	tab.onclick = () => {
		let tabmenu = $('#menu', tab)

		if (!a.length)
			return
		if (tabmenu) {
			tab.removeChild(tabmenu)
			return
		}

		let menu = make('div', { id: 'menu', class: 'dialog' }, tab)

		for (let i = 0; i < a.length; i++) {
			let menulink = make('a', {
				id: `menu-${str2id(a[i])}`,
				class: 'entry',
				href: 'test'
			}, menu)
			menulink.textContent = a[i]

			menulink.onclick = () => {
				$('.settings-link').click()
				$(`.tab-${tabname}`).click()

				if (tabname === 'main' || tabname === 'advanced')
					$(`fieldset:nth-child(${i + (tabname === 'main' ? 2 : 1)})`).scrollIntoView()
			}
		}
	}
}

/**
 * Settings dialog
**/
document.addEventListener('OpenSettings', () => {
	let dialog = $('#fourchanx-settings')
	let settingsnav = $('#fourchanx-settings > nav')
	let changeloglink = $('[href="https://github.com/ccd0/4chan-x/blob/master/CHANGELOG.md"]')

	// Move credits (right hand links) to the bottom
	if (!$('#fourchanx-settings > .statusbar'))
		dialog.appendChild($('.credits'))

	// Show version in statusbar instead
	if (changeloglink.textContent != 'Changelog') {
		let statusbar = make('footer', { class: 'statusbar' }, dialog)

		statusbar.textContent = changeloglink.textContent
		changeloglink.textContent = 'Changelog'
	}

	// Make the dialog moveable
	dialog.style.position = 'absolute'
	dialog.style.left = '187px'
	dialog.style.top = '126px'
	dialog.style.touchAction = 'none'
	settingsnav.style.cursor = 'move'

	settingsnav.addEventListener('pointerdown', e => {
		const move = e => {
			let x = dialog.offsetLeft + e.movementX
			let y = dialog.offsetTop + e.movementY

			dialog.style.left = `${x <= 10 ? e.movementX : x >= 1920 ? 1920 : x}px`
			dialog.style.top = `${y <= 10 ? e.movementY : y >= 1080 ? 1080 : y}px`
		}

		const up = () => {
			removeEventListener('pointermove', move)
			removeEventListener('pointerup', up)
		}

		addEventListener('pointermove', move, { passive: true })
		addEventListener('pointerup', up, { passive: true })
	})
})

