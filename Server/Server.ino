#include <stdio.h>
#include <string.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include<math.h>

#include <Ticker.h>
#include <PxMatrix.h>

Ticker display_ticker;

#include <NTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <time.h>
#include <Fonts/Org_01.h>

const int DHTPIN = 0;
const int DHTTYPE = DHT11;
DHT dht(DHTPIN, DHTTYPE);

/* Configuration of NTP */
#define MY_NTP_SERVER "europe.pool.ntp.org"
#define MY_TZ "<+07>-7"
time_t now;
tm tm;
int ngayAl, thangAl, namAl, preNgayAl = 0, preThangAl = 0, preNamAl = 0;
int preDay = 0, preMonth = 0, preYear = 0, preDayOfWeek = 0;
int preTemp = 0;
const long utcOffsetInSeconds = 25200;
bool clockStatus = false;
bool firstShowClock = false;

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient ntpClient(ntpUDP, "asia.pool.ntp.org", utcOffsetInSeconds);

unsigned long prevEpoch = 0;
byte prevhh;
byte prevmm;
byte prevss;

int dayDLr = 255, dayDLg = 255, dayDLb = 255, monthDLr = 255, monthDLg = 255, monthDLb = 255, yearDLr = 255, yearDLg = 255, yearDLb = 255, dowDLr = 255, dowDLg = 255, dowDLb = 255, dotDLr = 255, dotDLg = 255, dotDLb = 255;
int dayALr = 255, dayALg = 255, dayALb = 255, monthALr = 255, monthALg = 255, monthALb = 255, yearALr = 255, yearALg = 255, yearALb = 255, dotALr = 255, dotALg = 255, dotALb = 255;
int hourR = 255, hourG = 255, hourB = 255, minR = 255, minG = 255, minB = 255, secR = 255, secG = 255, secB = 255, colonR = 255, colonG = 255, colonB = 255;
int flickerColon = 0;
int tempR = 255, tempG = 255, tempB = 255;

// Pins for LED MATRIX
#define P_LAT 16
#define P_A 5
#define P_B 4
#define P_C 15
#define P_OE 2
#define P_D 12
#define P_E 0

PxMATRIX display(64, 32, P_LAT, P_OE, P_A, P_B, P_C, P_D, P_E);

#define HTTP_REST_PORT 80
#define WIFI_RETRY_DELAY 500
#define MAX_WIFI_INIT_RETRY 50

uint16_t arr[2050];

const char* wifi_ssid = "TamThanh 1";
const char* wifi_passwd = "password";

//=== SEGMENTS ===
#include "Digit.h"
Digit digit0(&display, 0, 55, 8, 6, 6, display.color565(secR, secG, secB));
Digit digit1(&display, 0, 46, 8, 6, 6, display.color565(secR, secG, secB));
Digit digit2(&display, 0, 32, 8, 6, 6, display.color565(minR, minG, minB));
Digit digit3(&display, 0, 23, 8, 6, 6, display.color565(minR, minG, minB));
Digit digit4(&display, 0,  9, 8, 6, 6, display.color565(hourR, hourG, hourB));
Digit digit5(&display, 0,  0, 8, 6, 6, display.color565(hourR, hourG, hourB));

//Week Days
String weekDays[7] = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};

ESP8266WebServer http_rest_server(HTTP_REST_PORT);

int init_wifi() {
  int retries = 0;

  Serial.println("Connecting to WiFi AP..........");

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid, wifi_passwd);
  // check the status of WiFi connection to be WL_CONNECTED
  while ((WiFi.status() != WL_CONNECTED) && (retries < MAX_WIFI_INIT_RETRY)) {
    retries++;
    delay(WIFI_RETRY_DELAY);
    Serial.print("#");
  }
  return WiFi.status(); // return the WiFi connection status
}

void json_to_arr(String post_body) {
  for (int i = 0; i < 2050; i++) {
    arr[i] = 0;
  }

  String temp = "";
  int j = 0;
  for (int i = 8; i < post_body.length() - 2; i++) {
    if (post_body[i] != ',') {
      temp += post_body[i];
      if (j == 2047) {
        arr[j] = temp.toInt();
      }
    } else {
      arr[j] = temp.toInt();
      j++;
      temp = "";
    }
  }

  display_ticker.attach(0.002, display_updater);
  yield();
  display.clearDisplay();
  drawImage(0, 0, arr);
}

void json_to_status(String post_body) {
  if (post_body[10] == '1') {
    display.clearDisplay();
    clockStatus = true;
    initClock();
  } else {
    display.clearDisplay();
    clockStatus = false;
  }
}

void json_to_color(String post_body) {
  int color[45];
  for (int i = 0; i < 43; i++) {
    color[i] = 0;
  }

  String temp = "";
  int j = 0;
  for (int i = 8; i < post_body.length() - 2; i++) {
    if (post_body[i] != ',') {
      temp += post_body[i];
      if (j == 42) {
        color[j] = temp.toInt();
      }
    } else {
      color[j] = temp.toInt();
      j++;
      temp = "";
    }
  }

  dayDLr = color[0]; dayDLg = color[1]; dayDLb = color[2]; monthDLr = color[3]; monthDLg = color[4]; monthDLb = color[5]; yearDLr = color[6]; yearDLg = color[7]; yearDLb = color[8]; dowDLr = color[9]; dowDLg = color[10]; dowDLb = color[11]; dotDLr = color[12]; dotDLg = color[13]; dotDLb = color[14];
  dayALr = color[27]; dayALg = color[28]; dayALb = color[29]; monthALr = color[30]; monthALg = color[31]; monthALb = color[32]; yearALr = color[33]; yearALg = color[34]; yearALb = color[35]; dotALr = color[36]; dotALg = color[37]; dotALb = color[38];
  hourR = color[15]; hourG = color[16]; hourB = color[17]; minR = color[18]; minG = color[19]; minB = color[20]; secR = color[21]; secG = color[22]; secB = color[23]; colonR = color[24]; colonG = color[25]; colonB = color[26];
  tempR = color[39]; tempG = color[40]; tempB = color[41];
  flickerColon = color[42];
  digit0.SetColor(display.color565(secR, secG, secB));
  digit1.SetColor(display.color565(secR, secG, secB));
  digit2.SetColor(display.color565(minR, minG, minB));
  digit3.SetColor(display.color565(minR, minG, minB));
  digit4.SetColor(display.color565(hourR, hourG, hourB));
  digit5.SetColor(display.color565(hourR, hourG, hourB));
  initClock();
}

void post_arr() {
  display.clearDisplay();
  String post_body = http_rest_server.arg("plain");
  //  Serial.println(post_body);

  if (http_rest_server.method() == HTTP_POST) {
    json_to_arr(post_body);

    StaticJsonDocument<200> res;
    char JSONmessageBuffer[200];
    res["res"] = "Success";
    serializeJsonPretty(res, JSONmessageBuffer, sizeof(JSONmessageBuffer));
    http_rest_server.send(200, "application/json", JSONmessageBuffer);
  }
}

void swichClock() {
  String post_body = http_rest_server.arg("plain");

  if (http_rest_server.method() == HTTP_POST) {
    json_to_status(post_body);

    StaticJsonDocument<200> res;
    char JSONmessageBuffer[200];
    res["res"] = "Success";
    serializeJsonPretty(res, JSONmessageBuffer, sizeof(JSONmessageBuffer));
    http_rest_server.send(200, "application/json", JSONmessageBuffer);
  }
}

void changeColor() {
  String post_body = http_rest_server.arg("plain");

  if (http_rest_server.method() == HTTP_POST) {
    json_to_color(post_body);

    StaticJsonDocument<200> res;
    char JSONmessageBuffer[200];
    res["res"] = "Success";
    serializeJsonPretty(res, JSONmessageBuffer, sizeof(JSONmessageBuffer));
    http_rest_server.send(200, "application/json", JSONmessageBuffer);
  }
}

void config_rest_server_routing() {
  http_rest_server.on("/", HTTP_GET, []() {
    http_rest_server.send(200, "text/html",
                          "Welcome to the ESP8266 REST Web Server");
  });
  http_rest_server.on("/arr", HTTP_POST, post_arr);
  http_rest_server.on("/swich", HTTP_POST, swichClock);
  http_rest_server.on("/color", HTTP_POST, changeColor);
}

// ISR for display refresh
void display_updater()
{
  display.display(70);
}

void drawImage(int x, int y,
               uint16_t arr[])
{
  int imageHeight = 32;
  int imageWidth = 64;
  int counter = 0;
  for (int yy = 0; yy < imageHeight; yy++)
  {
    for (int xx = 0; xx < imageWidth; xx++)
    {
      display.drawPixel(xx + x , yy + y, arr[counter]);
      counter++;
    }
  }
}

void display_update_enable(bool is_enable)
{
  if (is_enable)
    display_ticker.attach(0.004, display_updater);
  else
    display_ticker.detach();
}

void clearPixel(int x1, int x2) {
  for (int i = 0; i < 64; i++) {
    for (int j = x1; j <= x2; j++) {
      display.drawPixelRGB888(i, j, 0, 0, 0);
    }
  }
}

void clearTemp() {
  for (int i = 44; i < 55; i++) {
    for (int j = 27; j <= 31; j++) {
      display.drawPixelRGB888(i, j, 0, 0, 0);
    }
  }
}

void initClock() {
  preNgayAl = 0; preThangAl = 0; preNamAl = 0;
  preDay = 0; preMonth = 0; preYear = 0; preDayOfWeek = 0;
  prevEpoch = 0;
  preTemp = 0;
  firstShowClock = true;
}

void printTemp() {
  int temp = int(round(dht.readTemperature()));
  if (temp != preTemp) {
    clearTemp();
    display.setTextColor(display.color565(tempR, tempG, tempB));
    
    display.setCursor(44, 31);
    display.println(temp);

    display.drawPixelRGB888(57, 27, tempR, tempG, tempB);
    display.drawPixelRGB888(56, 27, tempR, tempG, tempB);
    display.drawPixelRGB888(57, 28, tempR, tempG, tempB);
    display.drawPixelRGB888(56, 28, tempR, tempG, tempB);
    
    display.setCursor(59, 31);
    display.println("C");

    preTemp = temp;
  }
}

void printDate() {
  int hh = ntpClient.getHours();
  int mm = ntpClient.getMinutes();
  int ss = ntpClient.getSeconds();

  if ((hh == 0 && mm == 0 && ss == 1) || firstShowClock == true) {
    //Duong Lich
    time(&now);                       // read the current time
    localtime_r(&now, &tm);           // update the structure tm with the current time

    int dd, mm, yy, dow;
    dd = tm.tm_mday;
    mm = tm.tm_mon + 1;
    yy = tm.tm_year + 1900;
    dow = tm.tm_wday;

    clearPixel(1, 5);
    display.setTextSize(1);
    display.setFont(&Org_01);

    display.setTextColor(display.color565(dowDLr, dowDLg, dowDLb));
    display.setCursor(3, 5);
    display.println(weekDays[dow]); //Day of week

    display.setTextColor(display.color565(dayDLr, dayDLg, dayDLb));
    display.setCursor(21, 5);
    if (dd < 10) {
      display.println("0" + String(dd)); //Day
    } else {
      display.println(String(dd)); //Day
    }

    display.setTextColor(display.color565(dotDLr, dotDLg, dotDLb));
    display.setCursor(33, 5);
    display.println("."); //Dot

    display.setTextColor(display.color565(monthDLr, monthDLg, monthDLb));
    display.setCursor(35, 5);
    if (mm < 10) {
      display.println("0" + String(mm)); //Month
    } else {
      display.println(String(mm)); //Month
    }

    display.setTextColor(display.color565(dotDLr, dotDLg, dotDLb));
    display.setCursor(47, 5);
    display.println("."); //Dot


    display.setTextColor(display.color565(yearDLr, yearDLg, yearDLb));
    display.setCursor(49, 5);
    display.println(String(yy - 2000)); //Year

    preDayOfWeek = dow;
    preDay = dd;
    preMonth = mm;
    preYear = yy;

    //Am Lich
    convertSolar2Lunar(dd, mm, yy);
    clearPixel(27, 31);
    display.setTextSize(1);
    display.setFont(&Org_01);

    display.setTextColor(display.color565(dayALr, dayALg, dayALb));
    display.setCursor(0, 31);
    if (ngayAl < 10) {
      display.println("0" + String(ngayAl)); //Day
    } else {
      display.println(String(ngayAl)); //Day
    }

    display.setTextColor(display.color565(dotALr, dotALg, dotALb));
    display.setCursor(12, 31);
    display.println("."); //Dot

    display.setTextColor(display.color565(monthALr, monthALg, monthALb));
    display.setCursor(14, 31);
    if (thangAl < 10) {
      display.println("0" + String(thangAl)); //Month
    } else {
      display.println(String(thangAl)); //Month
    }

    display.setTextColor(display.color565(dotALr, dotALg, dotALb));
    display.setCursor(26, 31);
    display.println("."); //Dot


    display.setTextColor(display.color565(yearALr, yearALg, yearALb));
    display.setCursor(28, 31);
    display.println(String(namAl - 2000)); //Year

    preNgayAl = ngayAl;
    preThangAl = thangAl;
    preNamAl = namAl;
    firstShowClock = false;
  }
}

void printTime() {
  ntpClient.update();
  unsigned long epoch = ntpClient.getEpochTime();
  //Serial.print("GetCurrentTime returned epoch = ");
  //  Serial.println(epoch);

  if (epoch != prevEpoch) {
    int hh = ntpClient.getHours();
    int mm = ntpClient.getMinutes();
    int ss = ntpClient.getSeconds();

    if (flickerColon == 0) {
      digit1.DrawColon(display.color565(colonR, colonG, colonB));
      digit3.DrawColon(display.color565(colonR, colonG, colonB));
    } else {
      if (ss % 2 == 0) {
        digit1.DrawColon(display.color565(colonR, colonG, colonB));
        digit3.DrawColon(display.color565(colonR, colonG, colonB));
      } else {
        digit1.DrawColon(display.color565(0, 0, 0));
        digit3.DrawColon(display.color565(0, 0, 0));
      }
    }

    if (prevEpoch == 0) { // If we didn't have a previous time. Just draw it without morphing.
      digit0.Draw(ss % 10);
      digit1.Draw(ss / 10);
      digit2.Draw(mm % 10);
      digit3.Draw(mm / 10);
      digit4.Draw(hh % 10);
      digit5.Draw(hh / 10);
    }
    else
    {
      // epoch changes every miliseconds, we only want to draw when digits actually change.
      if (ss != prevss) {
        int s0 = ss % 10;
        int s1 = ss / 10;
        if (s0 != digit0.Value()) digit0.Morph(s0);
        if (s1 != digit1.Value()) digit1.Morph(s1);
        //ntpClient.PrintTime();
        prevss = ss;
      }

      if (mm != prevmm) {
        int m0 = mm % 10;
        int m1 = mm / 10;
        if (m0 != digit2.Value()) digit2.Morph(m0);
        if (m1 != digit3.Value()) digit3.Morph(m1);
        prevmm = mm;
      }

      if (hh != prevhh) {
        int h0 = hh % 10;
        int h1 = hh / 10;
        if (h0 != digit4.Value()) digit4.Morph(h0);
        if (h1 != digit5.Value()) digit5.Morph(h1);
        prevhh = hh;
      }
    }
    prevEpoch = epoch;
  }
}

//Lay Ngày Julius
long getJulius(int intNgay, int intThang, int intNam)
{
  int a, y, m, jd;
  a = (int)((14 - intThang) / 12);
  y = intNam + 4800 - a;
  m = intThang + 12 * a - 3;
  jd = intNgay + (int)((153 * m + 2) / 5) + 365 * y + (int)(y / 4)  - (int)(y / 100) + (int)(y / 400) - 32045;
  if (jd < 2299161)
  {
    jd = intNgay + (int)((153 * m + 2) / 5) + 365 * y + (int)(y / 4)  - 32083;
  }
  return jd;
}

// Tinh ngay Soc
int getNewMoonDay(int k)
{
  float _PI = 3.14;
  double T, T2, T3, dr, Jd1, M, Mpr, F, C1, deltat, JdNew;
  T = k / 1236.85;
  T2 = T * T;
  T3 = T2 * T;
  dr = _PI / 180;
  double timeZone = 7.0;
  Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  // Mean new moon
  Jd1 = Jd1 + 0.00033 * sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  // Sun's mean anomaly
  M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  // Moon's mean anomaly
  Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  // Moon's argument of latitude
  F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  C1 = (0.1734 - 0.000393 * T) * sin(M * dr) + 0.0021 * sin(2 * dr * M);
  C1 = C1 - 0.4068 * sin(Mpr * dr) + 0.0161 * sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * sin(dr * 2 * F) - 0.0051 * sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * sin(dr * (M - Mpr)) + 0.0004 * sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * sin(dr * (2 * F - M)) - 0.0006 * sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * sin(dr * (2 * F - Mpr)) + 0.0005 * sin(dr * (2 * Mpr + M));
  if (T < -11)
  {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  }
  else
  {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  JdNew = Jd1 + C1 - deltat;
  return (int)(JdNew + 0.5 + timeZone / 24);
}
//Tính toa do mat troi
int getSunLongitude(int jdn)
{
  double timeZone = 7.0;
  float _PI = 3.14;
  double T, T2, dr, M, L0, DL, L;
  // Time in Julian centuries from 2000-01-01 12:00:00 GMT
  T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  T2 = T * T;
  // degree to radian
  dr = _PI / 180;
  // mean anomaly, degree
  M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  // mean longitude, degree
  L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * sin(dr * 2 * M) + 0.000290 * sin(dr * 3 * M);
  L = L0 + DL; // true longitude, degree
  L = L * dr;
  // Normalize to (0, 2*PI)
  L = L - _PI * 2 * (int)(L / (_PI * 2));
  return (int)(L / _PI * 6);
}
// Tìm ngày bat dau tháng 11 am lich
int getLunarMonthll(int intNam)
{
  double k, off, nm, sunLong;
  off = getJulius(31, 12, intNam) - 2415021;
  k = (int)(off / 29.530588853);
  nm = getNewMoonDay((int)k);
  // sun longitude at local midnight
  sunLong = getSunLongitude((int)nm);
  if (sunLong >= 9)
  {
    nm = getNewMoonDay((int)k - 1);
  }
  return (int)nm;
}
//Xác dinh thang nhuan
int getLeapMonthOffset(double a11)
{
  double last, arc;
  int k, i;
  k = (int)((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  last = 0;
  // We start with the month following lunar month 11
  i = 1;
  arc = getSunLongitude((int)getNewMoonDay((int)(k + i)));
  do
  {
    last = arc;
    i++;
    arc = getSunLongitude((int)getNewMoonDay((int)(k + i)));
  } while (arc != last && i < 14);
  return i - 1;
}
//Doi ra ngay am-duong
void convertSolar2Lunar(int intNgay, int intThang, int intNam)
{
  double dayNumber, monthStart, a11, b11, lunarDay, lunarMonth, lunarYear;
  //double lunarLeap;
  int k, diff;
  dayNumber = getJulius(intNgay, intThang, intNam);
  k = (int)((dayNumber - 2415021.076998695) / 29.530588853);
  monthStart = getNewMoonDay(k + 1);
  if (monthStart > dayNumber)
  {
    monthStart = getNewMoonDay(k);
  }
  a11 = getLunarMonthll(intNam);
  b11 = a11;
  if (a11 >= monthStart)
  {
    lunarYear = intNam;
    a11 = getLunarMonthll(intNam - 1);
  }
  else
  {
    lunarYear = intNam + 1;
    b11 = getLunarMonthll(intNam + 1);
  }
  lunarDay = dayNumber - monthStart + 1;
  diff = (int)((monthStart - a11) / 29);
  //lunarLeap = 0;
  lunarMonth = diff + 11;
  if (b11 - a11 > 365)
  {
    int leapMonthDiff = getLeapMonthOffset(a11);
    if (diff >= leapMonthDiff)
    {
      lunarMonth = diff + 10;
      if (diff == leapMonthDiff)
      {
        //lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12)
  {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4)
  {
    lunarYear -= 1;
  }
  ngayAl = int(lunarDay);
  thangAl = int(lunarMonth);
  namAl = int(lunarYear);
}

void setup(void) {
  Serial.begin(9600);

  configTime(MY_TZ, MY_NTP_SERVER);
  dht.begin();

  if (init_wifi() == WL_CONNECTED) {
    Serial.print("Connetted to ");
    Serial.print(wifi_ssid);
    Serial.print("--- IP: ");
    Serial.println(WiFi.localIP());
  }
  else {
    Serial.print("Error connecting to: ");
    Serial.println(wifi_ssid);
  }

  config_rest_server_routing();

  http_rest_server.begin();
  Serial.println("HTTP REST Server Started");

  ntpClient.begin();

  display.begin(16);
  display.clearDisplay();
  display.setBrightness(90);
  display.setTextSize(1);

  display.setTextColor(display.color565(0, 255, 0));
  display.setCursor(2, 5);
  display.print("Connect IP");

  display.setFont(&Org_01);
  display.setTextColor(display.color565(255, 89, 0));
  display.setCursor(11, 24);
  display.print(WiFi.localIP());

  display_update_enable(true);
}

void loop(void) {
  http_rest_server.handleClient();

  if (clockStatus) {
    printTime();
    printDate();
    printTemp();
  }
}
