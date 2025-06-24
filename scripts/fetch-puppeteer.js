import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SpecialRssIds = [
  '中华流病'
];

// 配置文件路径
const rssConfigPath = path.join(__dirname, '../src/data/rss.json');
const articlesPath = path.join(__dirname, '../src/data/articles.json');

// 读取配置文件
let rssConfig;
try {
  rssConfig = JSON.parse(fs.readFileSync(rssConfigPath, 'utf-8'));
} catch (error) {
  console.error('Error reading RSS config file:', error);
  process.exit(1);
}

// 从中华流行病学杂志网页提取数据
async function extractData_chinaepi(page) {
  // 等待文章列表加载
  await page.waitForSelector('table#table24', { timeout: 10000 });

  // 提取文章数据
  const articles = await page.evaluate(() => {
    const items = [];
    const tables = document.querySelectorAll('table#table24');

    tables.forEach(table => {
      const rows = Array.from(table.querySelectorAll('tr'));
      // 跳过第一个tr
      const dataRows = rows.slice(1);

      // 每5个tr为一组处理
      for (let i = 0; i < dataRows.length; i += 5) {
        if (i + 4 >= dataRows.length) break; // 确保有完整的5个tr

        const titleRow = dataRows[i];
        const authorRow = dataRows[i + 1];
        const dateRow = dataRows[i + 2];
        const infoRow = dataRows[i + 3];
        // 第5个tr是空的，跳过

        // 提取标题和链接
        const titleLink = titleRow.querySelector('a');
        const title = titleLink ? titleLink.textContent.trim() : '';

        // 提取作者
        const author = authorRow.querySelector('td:last-child')?.textContent.trim() || '';

        // 提取日期
        const pubDate = dateRow.querySelector('td:last-child')?.textContent.replace('出版日期:', '').trim() || '';

        // 提取信息行中的链接
        const infoLinks = infoRow.querySelectorAll('a');
        let abstractLink = '';
        let pdfLink = '';
        let htmlLink = '';

        infoLinks.forEach(link => {
          const text = link.textContent.trim();
          if (/摘要/.test(text)) {
            abstractLink = link.href;
          } else if (/下载 PDF/.test(text)) {
            pdfLink = link.href;
          } else if (/Html全文/.test(text)) {
            htmlLink = link.href;
          }
        });

        if (title) {
          const item = {
            title,
            author,
            pubDate,
            link: htmlLink,
            abstractLink,
            pdfLink,
            htmlLink
          };
          items.push(item);
        }
      }
    });

    return items;
  });

  if (!articles || articles.length === 0) {
    return [];
  }

  return articles;
}

// 使用Puppeteer抓取数据
async function fetchWithPuppeteer(url, source) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-extensions', '--disable-features=HttpsFirstBalancedModeAutoEnable', '--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  try {
    const page = await browser.newPage();

    // 设置更真实的浏览器特征
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // 设置请求头
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // 设置超时
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // 访问页面
    console.log(`Navigating to ${url}...`);

    // 修改页面加载策略
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded', // 改为等待DOM加载完成
        timeout: 30000
      });
    } catch (error) {
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.log('Retrying with different loading strategy...');
        await page.goto(url, {
          waitUntil: 'load', // 尝试使用load事件
          timeout: 30000
        });
      } else {
        throw error;
      }
    }

    // 等待页面加载完成
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });

    // 根据URL选择不同的提取策略
    let articles;
    if (url.includes('chinaepi.icdc.cn')) {
      articles = await extractData_chinaepi(page);
    } else {
      throw new Error('Unsupported URL pattern');
    }

    // 组装数据，添加source相关信息
    const formattedItems = articles.map(item => ({
      id: source.id,
      title: item.title || '',
      author: item.author || '',
      description: item.description || '',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: source.title,
      category: source.category
    }));

    return formattedItems;

  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  } finally {
    await browser.close();
  }
}

const filter_latest = (article, latestDays) => {
  const date = new Date(article.pubDate);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= latestDays;
}

async function fetchSpecialRSS(ids = SpecialRssIds) {
  try {
    let allArticles = [];
    console.log('Starting to fetch special RSS feeds...');

    // 读取现有的文章
    let existingArticles = [];
    try {
      if (fs.existsSync(articlesPath)) {
        const existingData = fs.readFileSync(articlesPath, 'utf-8');
        existingArticles = JSON.parse(existingData);
        console.log(`Read ${existingArticles.length} existing articles`);
      }
    } catch (error) {
      console.error('Error reading existing articles:', error);
    }

    // 只处理特殊的 RSS 源
    const specialSources = rssConfig.filter(source =>
      ids.includes(source.id)
    );

    for (const source of specialSources) {
      try {
        console.log(`Fetching from ${source.title}...`);
        let urls = [];

        // 如果是中华流病，获取当前月和前两个月的文章
        if (source.id === '中华流病') {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1; // 1-12

          // 生成当前月和前两个月的URL
          for (let i = 0; i < 3; i++) {
            let year = currentYear;
            let month = currentMonth - i;

            // 处理月份小于1的情况
            if (month < 1) {
              month += 12;
              year -= 1;
            }

            urls.push(`http://chinaepi.icdc.cn/zhlxbx/ch/reader/issue_list.aspx?year_id=${year}&quarter_id=${month}`);
          }
          console.log('Generated URLs:', urls);
        } else {
          urls = [source.url];
        }

        // 获取所有URL的文章
        for (const url of urls) {
          console.log(`Fetching from URL: ${url}`);
          const data = await fetchWithPuppeteer(url, source);

          if (data) {
            let articles = data;
            console.log(articles);

            // 按title去重
            articles = articles.filter((article, index, self) =>
              index === self.findIndex(t => t.title === article.title)
            );

            // 过滤最新的文章
            if (['中华流病'].includes(source.id)) {
              articles = articles.filter(article => filter_latest(article, 90));
            }

            console.log(`Successfully fetched ${articles.length} articles from ${url}`);
            allArticles = [...allArticles, ...articles];
          }
        }
      } catch (error) {
        console.error(`Error fetching ${source.title}:`, error.message);
      }
    }

    // 合并新旧文章并按title去重
    const mergedArticles = [...existingArticles, ...allArticles];
    const uniqueArticles = mergedArticles.filter((article, index, self) =>
      index === self.findIndex(t => t.title === article.title)
    );

    // 先按id排序，相同id再按发布日期排序（最新的在前）
    uniqueArticles.sort((a, b) => {
      // 先比较id
      if (a.id !== b.id) {
        return a.id.localeCompare(b.id);
      }
      // id相同时按发布日期排序
      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    console.log(`Total articles after merging and deduplication: ${uniqueArticles.length}`);

    // 确保输出目录存在
    const articlesDir = path.dirname(articlesPath);
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    // 保存到文件
    fs.writeFileSync(
      articlesPath,
      JSON.stringify(uniqueArticles, null, 2)
    );

    console.log(`Successfully saved ${uniqueArticles.length} articles to ${articlesPath}`);
  } catch (error) {
    console.error('Error in fetchSpecialRSS:', error.message);
    process.exit(1);
  }
}

// 执行抓取
console.log('Special RSS feed fetcher starting...');
fetchSpecialRSS().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});