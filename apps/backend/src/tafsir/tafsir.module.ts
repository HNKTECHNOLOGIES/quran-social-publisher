import { Module } from '@nestjs/common';
import { QuranModule } from '../quran/quran.module';
import { TafsirService } from './tafsir.service';

@Module({
  imports: [QuranModule],
  providers: [TafsirService],
  exports: [TafsirService],
})
export class TafsirModule {}
