* * *

🧩 Google Chrome Extension
==========================

A custom **Google Chrome extension** (also works with **Firefox Nightly Dev builds**) that enhances your new tab page with widgets like time, calendar, weather, speedtest, and background customization.

* * *

⚡ Quick Install
---------------

1. Clone or [download this repo](#).
    
2. Open Chrome → `Settings` → `Extensions` → enable **Developer mode**.
    
3. Click **Load unpacked** → select this repo’s folder → ✅ Done!
    

* * *

📥 Detailed Installation
------------------------

1. **Open your browser**
    
    * Works on **Google Chrome**
        
    * Also works on **Firefox Nightly (Dev builds only)**
        
2. **Enable Developer Mode**
    
    * Go to: `Settings` → `Extensions`
        
    * Toggle **Developer mode** (top-right corner)
        
3. **Load the extension**
    
    * Click **Load unpacked**
        
    * Select this repository’s folder
        
    * The extension will activate automatically
        

* * *

⚙️ Features
-----------

* **Center (top):** Current time, date, and calendar week
    
* **Top left:** Calendar
    
* **Top right:** Weather widget
    
    * Default location: `Deggendorf`
        
    * To change: edit `script.js` → update this line:
        
        ```js
        weather.fetchWeather("YourCityHere");
        ```
        
* **Bottom left:** Speedtest shortcut
    
* **Bottom right:** Background image changer
    

* * *

🖼️ Preview
-----------

Here’s how the extension looks in action:

![Extension preview](/preview.jpg)

* * *

📝 Notes
--------

* Default weather location can be customized inside `script.js`.
    
* Background images can be replaced with your own (default must replace `default.png`)

* Images set with the buttons are saved through Chrome Storage.
    
* Works best on the latest Chrome or Firefox Nightly builds.
    

* * *