import express from "express"
import puppeteer from 'puppeteer';



const browser = await puppeteer.launch();
const page = await browser.newPage();