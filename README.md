* * *

<div align="center">

🌐 Chromium Extension
============================

**A customizable new tab extension with widgets for time, calendar, weather, speedtest, and background images**  
🖥️📅☁️⚡🌈

![Projekt-Status](https://img.shields.io/badge/Status-Aktiv-brightgreen) ![Lizenz](https://img.shields.io/badge/Lizenz-NonCommercial%20MIT-blue) ![Version](https://img.shields.io/badge/Version-6.0-orange)

</div>

* * *

✨ Authors
---------

| Name | GitHub | Role | Contact | Contributions |
| --- | --- | --- | --- | --- |
| **[Daniel Sichler aka Darexsh](https://github.com/Darexsh)** | [Link](https://github.com/Darexsh?tab=repositories) | Extension & Web Development 🖥️🛠️, UI Design 🎨 | 📧 [E-Mail](mailto:sichler.daniel@gmail.com) | Concept, Widget Development, Web Dashboard, UI Design, Feature Integration |


* * *

🚀 About the Project
--------------------

A custom **extension for Chromium-based browsers** (Chrome, Edge, Brave, and others) which shows the current date, time and calendar week. Shortcuts for a calendar, weather, speedtest and image changer are also given. Also compatible with **Firefox Nightly Dev builds**.

* * *

⚡ Quick Install
---------------

1. Clone or [download this repo](#).
    
2. Open your browser → `Settings` → `Extensions` → enable **Developer mode**.
    
3. Click **Load unpacked** → select this repo’s folder → ✅ Done!
    

* * *

📥 Detailed Installation
------------------------

1. **Open your browser**
    
    * Works on **any Chromium-based browser** (Chrome, Edge, Brave, etc.)
        
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
        
    * To change: edit `script.js` →
        
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

* Default weather location can be customized inside `script.js`
    
* Background images can be replaced with your own (default must replace `default.png`)
    
* Images set with the buttons are saved through browser storage
    
* Works best on the latest Chromium-based browsers
    

* * *

📜 License
----------

This project is licensed under the **Non-Commercial MIT License** and was developed as an educational project. You are free to use, modify, and distribute the code for **non-commercial purposes only**, and must credit the author:

**Copyright (c) 2025 Daniel Sichler aka Darexsh**

Please include the following notice with any use or distribution:

> Developed by Daniel Sichler aka Darexsh. Licensed under the Non-Commercial MIT License. See `LICENSE` for details.

The full license is available in the [LICENSE](LICENSE) file.

* * *
<div align="center"> <sub>Created with ❤️ by Daniel Sichler</sub> </div>
