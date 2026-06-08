import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ChapterDto,
  SearchVersesQueryDto,
  SearchVersesResponseDto,
  SurahVersesQueryDto,
  SurahVersesResponseDto,
  VerseDto,
} from './dto/verses.dto';
import { VersesService } from './verses.service';

@ApiTags('Versets')
@ApiBearerAuth()
@Controller('verses')
@UseGuards(JwtAuthGuard)
export class VersesController {
  constructor(private readonly versesService: VersesService) {}

  @Get('chapters')
  @ApiOperation({ summary: 'Liste des 114 sourates' })
  getChapters(): Promise<ChapterDto[]> {
    return this.versesService.getChapters();
  }

  @Get('search')
  @ApiOperation({ summary: 'Recherche de versets par mot-clé' })
  search(@Query() query: SearchVersesQueryDto): Promise<SearchVersesResponseDto> {
    return this.versesService.searchVerses(
      query.q,
      query.page,
      query.size,
    );
  }

  @Get('surah/:surah')
  @ApiOperation({ summary: 'Versets d’une sourate (paginé)' })
  @ApiParam({ name: 'surah', example: 2 })
  getBySurah(
    @Param('surah', ParseIntPipe) surah: number,
    @Query() query: SurahVersesQueryDto,
  ): Promise<SurahVersesResponseDto> {
    return this.versesService.getVersesBySurah(
      surah,
      query.page,
      query.perPage,
    );
  }

  @Get(':surah/:verse')
  @ApiOperation({ summary: 'Détail d’un verset avec tafsirs autorisés' })
  @ApiParam({ name: 'surah', example: 2 })
  @ApiParam({ name: 'verse', example: 255 })
  getVerse(
    @Param('surah', ParseIntPipe) surah: number,
    @Param('verse', ParseIntPipe) verse: number,
  ): Promise<VerseDto> {
    return this.versesService.getVerseDetail(surah, verse);
  }
}
