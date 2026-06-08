import { Module } from '@nestjs/common';
import { QuranModule } from '../quran/quran.module';
import { TafsirModule } from '../tafsir/tafsir.module';
import { VersesController } from './verses.controller';
import { VersesService } from './verses.service';

@Module({
  imports: [QuranModule, TafsirModule],
  controllers: [VersesController],
  providers: [VersesService],
})
export class VersesModule {}
