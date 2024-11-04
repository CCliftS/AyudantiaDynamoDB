import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { CreateStudentDTO } from 'src/dto/create_student.dto';
import { CreateCourseDTO } from 'src/dto/create_course.dto';

@Controller('dynamo')
export class DynamoController {
  constructor(private readonly dynamoService: DynamoService) {}

  @Post('create-table')
  async createTable(@Body('tableName') tableName: string) {
    return this.dynamoService.createTable(tableName);
  }

  @Post('create-student')
  async createStudent(@Body() createStudentDto: CreateStudentDTO) {
    return this.dynamoService.createStudents(createStudentDto);
  }

  @Post('Update-GSI')
  async addGSI() {
    return this.dynamoService.updateTable();
  }

  @Put('student/:id')
  async updateStudent(@Param('id') id: string, @Body() updateStudentDto: CreateStudentDTO) {
    return this.dynamoService.update(id, updateStudentDto);
  }

  @Delete('student/:id')
  async deleteStudent(@Param('id') id: string) {
    return this.dynamoService.delete(id);
  }

  @Post('create-courses-table')
  async createCoursesTable() {
    return this.dynamoService.createTable('Cursos2');
  }

  @Post('create-course')
  async createCourse(@Body() createCourseDto: CreateCourseDTO) {
    return this.dynamoService.createCourse(createCourseDto);
  }

  @Put('student/:id/courses')
  async updateStudentCourses(@Param('id') id: string, @Body('cursoIDs') cursoIDs: string[]) {
    return this.dynamoService.updateStudentCourses(id, cursoIDs);
  }

  @Get('student/:id/courses')
  async getStudentCourses(@Param('id') id: string) {
    return this.dynamoService.getStudentCourses(id);
  }

  @Get('students-by-name/:name')
  async queryByName(@Param('name') name: string) {
    return this.dynamoService.queryByName(name);
  }

  @Get('students')
  async getAllStudents() {
    return this.dynamoService.getAllStudents();
  }

  @Get('students/filter')
  async scanWithFilter(@Query('attribute') attribute: string, @Query('value') value: string) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return this.dynamoService.scanWithFilter(attribute, numericValue);
    } else {
      return this.dynamoService.scanWithFilter(attribute, value);
    }
  }
}