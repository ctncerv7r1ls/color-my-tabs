#### 2.2.0
* Added a preference to set the active tab indication bar's thickness.
* Added a preference to disable drawing of dark line at the bottom of inactive tabs.
* Forced precise dominant color lookup to be always used.
* Removed advanced preference for toggling precise color lookup. 
* Restyled preferences window layout.
* Moved color brightness correction into advanced preferences tab. 

#### 2.1.10
* Restored the previous method of detecting favicon changes.

#### 2.1.9
* Changed method of detecting favicon changes.

#### 2.1.8
* Fixed comaptibility with Pale Moon versions older than 27.
* Fixed internal errors related to image loading and asynchronous method calls.
* Improved method of retrieving favicons.

#### 2.1.7
* Changed default tab color to lighter.

#### 2.1.6
* Removed auto-update support.
* Enabled more precise dominant color lookup by default.

#### 2.1.5
* Fixed indication bar styling for several custom themes.
* Increased default tab fading power.

#### 2.1.4
* Fixed visual glitch of indication bar when tabs are on bottom.

#### 2.1.3
* Fixed some minor issues.

#### 2.1.2
* Added preferences sync support.

#### 2.1.1
* Added option to clear colors cahce in advanced preferences window.
* Fixed some minor issues.

#### 2.1.0
* Fixed broken tab events removal.
* Added advanced color related preferences.

#### 2.0.4
* Added auto-update support.

#### 2.0.3
* Fixed redundant creation of indication bar for windows without nav-bar.
* Fixed tab braightness correction ignoring cases dependant on default color.
* Fixed some other minor issues.
* Changed labels of buttons in preferences window to be more meaningful.

#### 2.0.2
* Fixed black color blinking in indication bar when opening a new tab.
* Added compatibility fixes for few custom themes.
* Improved method of determining whether color should be ingored.
* Disabled console logspam.

#### 2.0.1
* Fixed broken boolean preference saving.
* Fixed "showIndicationBar" preference being ignored during initialziation.
* Improved clean up methods when closing windows.
* Improved some other minor things.

#### 2.0.0
* Rewrote from Add-on SDK to bootstrapped XUL extension.
* Fixed all previous bugs.
* Reworked visual indication of pinned&notified tab.
* Improved brightness correction calculation.

#### 1.4.0
* Added an option to change tab title color and tab title shadow color per each state.
* Changed default tab color to be less blueish.

#### 1.3.3
* Added missing visual state for pinned&notified tab.
* Replaced "Prevent extensive color darkening" option with "Allow slight color brightness fixes".
* Improved color brightness calculation and its settings.
* Fixed some other minor issues.

#### 1.3.1
* Added compatibility with several custom themes.

#### 1.3.0
* Changed simple inline preferences to classic XUL dialog.
* Reorganized preferences layout.

#### 1.2.2
* Fixed broken things related to indication bar.
* Fixed some other minor things.

#### 1.2.1
* Fixed broken saving of preferences.

#### 1.2.0
* Fixed an issue with single color of indication bar in multiple windows.
* Fixed ignored "tabs on top" preference by the indication bar.
* Improved speed of retrieving favicons.
* Improved dominant color lookup algorithm.
* Added an option to prevent extensive color darkening.

#### 1.1.4
* Added compatibility with Noia Moon theme.

#### 1.1.3
* Added compatibility with Moonfox theme.

#### 1.1.1
* Fixed a bug with preferences being wrongly saved.

#### 1.1.0
* Added an option to make active tab title bold by default.

#### 1.0.2
* Fixed a bug with processing whole images instead of favicon previews.
* Fixed a bug with wrongly colored tab indication bar.

#### 1.0.0
* Published initial version.