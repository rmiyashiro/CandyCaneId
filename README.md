# CandyCaneId

Chrome extension for making ObjectIds more identifiable.

## How It Works

This extension searches the page for
any [MongoDB ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/) strings and
colorizes them in a way that is more distinguishable and actually conveys some useful information.

As plain hexadecimal strings, ObjectId values tend to all look the same which makes it easy to
confuse them with each other and more difficult to remember them over time.

By visualizing ObjectIds as uniquely colored blocks they suddenly become recognizable entities. It
is immediately obvious when two ObjectIds are the same or different. And commonly seen ObjectIds are
more memorable and familiar.

## Install

1. Download repo
2. Go to chrome://extensions/
3. Enable "Developer Mode"
4. Click "Load unpacked"
5. Select src directory
6. Pin extension

## Settings

Click on the extension icon to adjust the settings to your liking:

- Use Saturation and Lightness sliders to adjust the intensity of the colors
- Use Hue sliders to shift the hue spectrum for each band of color
- Toggle the Enabled checkbox to turn the colorization on/off
- Double-click on the "CandyCaneId" title to factory reset the extension
