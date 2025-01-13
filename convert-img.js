
import { Command } from 'commander';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import process from 'node:process';

const program = new Command();

const processImage = async (filePath, output2x, output1x, webpOutput, avifOutput, fileName, fileExt) => {
  if (fileExt === '.jpg' || fileExt === '.jpeg') {
    await sharp(filePath).jpeg({ quality: 100 }).toFile(output2x);
    const { width } = await sharp(output2x).metadata();
    await sharp(filePath).resize({ width: Math.round(width / 2) }).jpeg({ quality: 100 }).toFile(output1x);

    await Promise.all([
      sharp(output2x).webp({ quality: 100 }).toFile(path.join(webpOutput, `${fileName}@2x.webp`)),
      sharp(output2x).avif({ quality: 100 }).toFile(path.join(avifOutput, `${fileName}@2x.avif`)),
      sharp(output1x).webp({ quality: 100 }).toFile(path.join(webpOutput, `${fileName}@1x.webp`)),
      sharp(output1x).avif({ quality: 100 }).toFile(path.join(avifOutput, `${fileName}@1x.avif`))
    ]);
  } else if (fileExt === '.png') {
    await sharp(filePath).png({ compressionLevel: 4 }).toFile(output2x);
    const { width } = await sharp(output2x).metadata();
    await sharp(filePath).resize({ width: Math.round(width / 2) }).png({ compressionLevel: 4 }).toFile(output1x);

    await Promise.all([
      sharp(output2x).webp({ quality: 100 }).toFile(path.join(webpOutput, `${fileName}@2x.webp`)),
      sharp(output2x).avif({ quality: 100 }).toFile(path.join(avifOutput, `${fileName}@2x.avif`)),
      sharp(output1x).webp({ quality: 100 }).toFile(path.join(webpOutput, `${fileName}@1x.webp`)),
      sharp(output1x).avif({ quality: 100 }).toFile(path.join(avifOutput, `${fileName}@1x.avif`))
    ]);
  }
};

const processImages = async (source, destination) => {
  if (!fs.existsSync(source)) {
    console.warn('Папка с исходными изображениями не существует');
    return;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const webpOutput = path.join(destination, 'webp');
  const avifOutput = path.join(destination, 'avif');

  if (!fs.existsSync(webpOutput)) fs.mkdirSync(webpOutput, { recursive: true });
  if (!fs.existsSync(avifOutput)) fs.mkdirSync(avifOutput, { recursive: true });

  const files = fs.readdirSync(source).filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase()));

  await Promise.all(files.map(async (file) => {
    const filePath = path.join(source, file);
    const fileName = path.parse(file).name;
    const fileExt = path.parse(file).ext.toLowerCase();
    const output2x = path.join(destination, `${fileName}@2x${fileExt}`);
    const output1x = path.join(destination, `${fileName}@1x${fileExt}`);
    const webp2x = path.join(webpOutput, `${fileName}@2x.webp`);
    const avif2x = path.join(avifOutput, `${fileName}@2x.avif`);
    const webp1x = path.join(webpOutput, `${fileName}@1x.webp`);
    const avif1x = path.join(avifOutput, `${fileName}@1x.avif`);

    // Проверка, существуют ли все нужные файлы, чтобы избежать повторной обработки
    const filesExist = fs.existsSync(output2x) &&
      fs.existsSync(output1x) &&
      fs.existsSync(webp2x) &&
      fs.existsSync(avif2x) &&
      fs.existsSync(webp1x) &&
      fs.existsSync(avif1x);

    if (!filesExist) {
      await processImage(filePath, output2x, output1x, webpOutput, avifOutput, fileName, fileExt);
    }
  }));

  console.info('Обработка изображений завершена');
};

const removeProcessedFiles = (filePath, destination) => {
  const fileName = path.parse(filePath).name;
  const fileExt = path.parse(filePath).ext.toLowerCase();

  const output2x = path.join(destination, `${fileName}@2x${fileExt}`);
  const output1x = path.join(destination, `${fileName}@1x${fileExt}`);

  const webpOutput = path.join(destination, 'webp');
  const avifOutput = path.join(destination, 'avif');

  fs.unlink(output2x, (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${output2x}`);
  });
  fs.unlink(output1x, (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${output1x}`);
  });

  fs.unlink(path.join(webpOutput, `${fileName}@2x.webp`), (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${path.join(webpOutput, `${fileName}@2x.webp`)}`);
  });
  fs.unlink(path.join(avifOutput, `${fileName}@2x.avif`), (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${path.join(avifOutput, `${fileName}@2x.avif`)}`);
  });
  fs.unlink(path.join(webpOutput, `${fileName}@1x.webp`), (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${path.join(webpOutput, `${fileName}@1x.webp`)}`);
  });
  fs.unlink(path.join(avifOutput, `${fileName}@1x.avif`), (err) => {
    if (err) console.warn(`Не удалось удалить файл: ${path.join(avifOutput, `${fileName}@1x.avif`)}`);
  });
};

const watchImages = (source, destination) => {
  const watcher = chokidar.watch(source, { persistent: true });

  watcher
    .on('add', async (filePath) => {
      console.log(`Добавлен новый файл: ${filePath}`);
      const fileName = path.parse(filePath).name;
      const fileExt = path.parse(filePath).ext.toLowerCase();
      const output2x = path.join(destination, `${fileName}@2x${fileExt}`);
      const output1x = path.join(destination, `${fileName}@1x${fileExt}`);
      const webpOutput = path.join(destination, 'webp');
      const avifOutput = path.join(destination, 'avif');

      // Проверка, существует ли файл @2x или @1x перед началом обработки
      const filesExist = fs.existsSync(output2x) &&
        fs.existsSync(output1x) &&
        fs.existsSync(path.join(webpOutput, `${fileName}@2x.webp`)) &&
        fs.existsSync(path.join(avifOutput, `${fileName}@2x.avif`)) &&
        fs.existsSync(path.join(webpOutput, `${fileName}@1x.webp`)) &&
        fs.existsSync(path.join(avifOutput, `${fileName}@1x.avif`));

      if (!filesExist) {
        const output2x = path.join(destination, `${fileName}@2x${fileExt}`);
        const output1x = path.join(destination, `${fileName}@1x${fileExt}`);
        await processImage(filePath, output2x, output1x, webpOutput, avifOutput, fileName, fileExt);
      }
    })
    .on('unlink', (filePath) => {
      console.log(`Удален файл: ${filePath}`);
      removeProcessedFiles(filePath, destination);
    })
    .on('error', (error) => {
      console.error(`Ошибка наблюдателя за файлами: ${error.message}`);
    });

  console.log(`Наблюдатель за папкой ${source} запущен`);
};

program
  .name('image-convert')
  .version('0.0.1')
  .description('Convert images')
  .argument('<source>', 'Папка с исходными изображениями')
  .argument('<destination>', 'Папка для конвертированных изображений')
  .action(async (source, destination) => {
    await processImages(source, destination);
    watchImages(source, destination);
  });

program.parse(process.argv);
