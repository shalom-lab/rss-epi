import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 日志文件路径
const logPath = path.join(__dirname, 'log.txt');

// 写入日志的函数
function writeLog(message) {
  const timestamp = new Date().toISOString().split('T')[0]; // 获取当前日期 YYYY-MM-DD
  const logEntry = `${timestamp}: ${message}\n`;
  
  try {
    // 如果文件不存在，创建文件
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '');
    }
    
    // 读取现有日志
    const existingLogs = fs.readFileSync(logPath, 'utf-8');
    const lines = existingLogs.split('\n').filter(line => line.trim());
    
    // 检查今天是否已经有日志
    const todayLog = lines.find(line => line.startsWith(timestamp));
    
    if (todayLog) {
      // 如果今天已经有日志，更新它
      const updatedLogs = lines.map(line => 
        line.startsWith(timestamp) ? logEntry.trim() : line
      ).join('\n');
      fs.writeFileSync(logPath, updatedLogs + '\n');
    } else {
      // 如果今天还没有日志，添加新行
      fs.appendFileSync(logPath, logEntry);
    }
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

const parser = new Parser({
  timeout: 10000, // 10秒超时
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0;)'
  }
});

const rssConfigPath = path.join(__dirname, '../src/data/rss.json');
const articlesPath = path.join(__dirname, '../src/data/articles.json');

let rssConfig;
try {
  rssConfig = JSON.parse(fs.readFileSync(rssConfigPath, 'utf-8'));
} catch (error) {
  console.error('Error reading RSS config file:', error);
  process.exit(1);
}

// 添加超时处理的辅助函数
const fetchWithTimeout = async (source) => {
  try {
    const feed = await Promise.race([
      parser.parseURL(source.url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
    ]);
    return feed;
  } catch (error) {
    console.error(`Error fetching ${source.title}: ${error.message}`);
    return null;
  }
};

// 过滤最新文章
const filter_latest = (article, latestDays) => {
  const date = new Date(article.pubDate);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= latestDays;
}

async function fetchRSS() {
  try {
    let allArticles = [];
    let errorSources = []; // 记录出错的源
    console.log('Starting to fetch RSS feeds...');

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

    for (const source of rssConfig) {
      try {
        console.log(`Fetching from ${source.title}...`);
        const feed = await fetchWithTimeout(source);

        if (!feed || !feed.items) {
          throw new Error('No feed or items found');
        }

        let articles = feed.items.map(item => ({
          id: source.id,
          title: item.title || '',
          description: item.contentSnippet || item.description || '',
          link: item.link || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: source.title,
          category: source.category
        }));
        
        //按title去重
        articles = articles.filter((article, index, self) =>
          index === self.findIndex(t => t.title === article.title)
        );
        
        //filter
        if (['MMWR', 'EJD', 'Epidemiology', 'AJPH'].includes(source.id)) {
          articles = articles.filter(article => filter_latest(article, 60));
        }
        
        console.log(`Successfully fetched ${articles.length} articles from ${source.title}`);
        allArticles = [...allArticles, ...articles];
      } catch (error) {
        console.error(`Error fetching ${source.title}:`, error.message);
        errorSources.push(`${source.title} (${error.message})`);
      }
    }

    if (allArticles.length === 0) {
      throw new Error('No articles were fetched from any source');
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
    
    // 如果有出错的源，记录到日志
    if (errorSources.length > 0) {
      const errorMessage = `Failed sources: ${errorSources.join('; ')}`;
      writeLog(errorMessage);
    } else {
      writeLog('All sources fetched successfully');
    }
    
    // 显式退出进程
    process.exit(0);
  } catch (error) {
    console.error('Error in fetchRSS:', error.message);
    writeLog(`Critical error: ${error.message}`);
    process.exit(1);
  }
}

// 执行抓取
console.log('RSS feed fetcher starting...');
fetchRSS().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});