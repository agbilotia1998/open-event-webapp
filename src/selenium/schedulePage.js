var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var SchedulePage = Object.create(BasePage);
var datesId = ['2017-03-17', '2017-03-18', '2017-03-19'];

SchedulePage.checkIsolatedBookmark = function() {
  var self = this;
  var bookmarkSessionsIdsArr = ['3015'];
  var visibleCheckSessionsIdsArr = ['3014', '3015', '2918'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
};

SchedulePage.toggleSessionElem = function() {
  var self = this;

  // Checking the toggle behaviour of session having id 3014
  var promise = new Promise(function(resolve) {

    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id('desc-3014')).isDisplayed());
    });
  });

  return promise;
};

SchedulePage.getVisibleDates = function(mode) {
  var self = this;

  if (mode == 'list') {
    return self.find(By.className('list-view')).findElements(By.className('day-filter')).then(self.getElemsDisplayStatus);
  }
  else if (mode == 'calendar') {
    return self.find(By.className('calendar-view')).findElements(By.className('calendar')).then(self.getElemsDisplayStatus);
  }
};

SchedulePage.getCurrentView = function() {
  // Gives the current status about visibility of the date divs inside the list and the calendar container
  var promiseArr = [];
  promiseArr.push(this.getVisibleDates('list'));
  promiseArr.push(this.getVisibleDates('calendar'));
  return Promise.all(promiseArr);
};

SchedulePage.changeDay = function(dayNo) {
  var self = this;
  var dateId = datesId[dayNo - 1];
  return self.find(By.id(dateId)).then(self.click).then(self.getCurrentView.bind(self));
};

SchedulePage.toggleMode = function() {
  var self = this;
  var toggleButtonId = 'page-mode';

  return self.find(By.id(toggleButtonId)).then(self.click).then(self.getCurrentView.bind(self));
};

SchedulePage.getDownloadDropdown = function() {
  var self = this;
  var downloadButtonId = 'dropdown-toggle';
  var promiseArr = [];

  var promise = new Promise(function (resolve) {
      self.find(By.className(downloadButtonId)).then(self.click).then(self.driver.sleep(1000)).then(function () {
         self.find(By.className('export-png')).then(self.click).then(self.driver.sleep(10000)).then(function(){
          // Return only base file name without dir

          function getMostRecentFileName(dir) {
              var files = fs.readdirSync(dir);

              // use underscore for max()
              return _.max(files, function (f) {
                  var fullpath = path.join(dir, f);

                  // ctime = creation time is used
                  // replace with mtime for modification time
                  return fs.statSync(fullpath).ctime;
              });
          }

          var DownloadedFile = getMostRecentFileName(path.join('C:','Users','Administrator','Downloads'));
          if(DownloadedFile === '2017-03-19 day-filter.png')
          {
              promiseArr.push(true);
          }
          else{
              promiseArr.push(false);
          }
         }).then(function() {
             self.find(By.className(downloadButtonId)).then(self.click).then(self.driver.sleep(1000)).then(function () {
                 self.find(By.className('export-schedule')).then(self.click).then(self.driver.sleep(10000)).then(function () {
                     // Return only base file name without dir
                     function getMostRecentFileName(dir) {
                         var files = fs.readdirSync(dir);

                         // use underscore for max()
                         return _.max(files, function (f) {
                             var fullpath = path.join(dir, f);

                             // ctime = creation time is used
                             // replace with mtime for modification time
                             return fs.statSync(fullpath).ctime;
                         });
                     }

                     var DownloadedFile = getMostRecentFileName(path.join('C:','Users','Administrator','Downloads'));

                     if (DownloadedFile === 'FOSSASIA Summit.ics') {
                         promiseArr.push(true);
                     }
                     else {
                         promiseArr.push(false);
                     }
                     resolve(Promise.all(promiseArr));
                 });
             });
         });
      });
    });
  return promise;
};

module.exports = SchedulePage;

