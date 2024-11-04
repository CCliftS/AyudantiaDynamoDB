import { Injectable } from '@nestjs/common';
import { CreateTableCommand, DynamoDBClient, QueryCommand, ScanCommand, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CreateStudentDTO } from 'src/dto/create_student.dto';
import { CreateCourseDTO } from 'src/dto/create_course.dto';

@Injectable()
export class DynamoService {
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    const dbClient = new DynamoDBClient({ 
        region: 'us-west-2', 
        endpoint:'http://localhost:27017',
        credentials: {
            accessKeyId: 'fakeMyKeyId',
            secretAccessKey: 'fakeSecretAccessKey', 
        },
    }); 
    this.client = DynamoDBDocumentClient.from(dbClient);
  }

  async createTable(TableName: string) {                     // Utilizado para el ejercicio 1
    const command = new CreateTableCommand({
      TableName: TableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }, 
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }, 
      ],
      BillingMode: 'PAY_PER_REQUEST', 
    });

    try {
      await this.client.send(command);
      console.log('Tabla creada exitosamente');
    } catch (error) {
      console.error('Error al crear la tabla:', error);
    }
  }

  async createStudents(item: CreateStudentDTO) {      // Utilizado para el ejercicio 1 y 2
    const command = new PutCommand({
      TableName: 'Estudiantes2', 
      Item: item,
    });

    await this.client.send(command);
  }

  async update(id: string, item: Partial<CreateStudentDTO>) {     // Utilizado para el ejercicio 3
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
  
    if (item.nombre) {
      updateExpressions.push('#nombre = :nombre');
      expressionAttributeNames['#nombre'] = 'nombre';
      expressionAttributeValues[':nombre'] = item.nombre;
    }
  
    if (item.edad) {
      updateExpressions.push('#edad = :edad');
      expressionAttributeNames['#edad'] = 'edad';
      expressionAttributeValues[':edad'] = item.edad;
    }
  
    const command = new UpdateCommand({
      TableName: 'Estudiantes2',
      Key: { id },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
  
    await this.client.send(command);
  }

  async scanWithFilter(attribute: string, value: any) {   // Utilizado para el ejercicio 4 (sirve para filtrar por cualquier atributo)
    let attributeValue;
    if (typeof value === 'string') {
      attributeValue = { S: value };
    } else if (typeof value === 'number') {
      attributeValue = { N: value.toString() };
    } else {
      throw new Error('Unsupported attribute value type');
    }
  
    const command = new ScanCommand({
      TableName: 'Estudiantes2',
      FilterExpression: '#attr >= :val',
      ExpressionAttributeNames: {
        '#attr': attribute,
      },
      ExpressionAttributeValues: {
        ':val': attributeValue,
      },
    });
  
    try {
      const result = await this.client.send(command);
      return result.Items;
    } catch (error) {
      console.error('Error al escanear con filtro:', error);
    }
  }

  async delete(id: string) {                    // Utilizado para el ejercicio 5
    const command = new DeleteCommand({
      TableName: 'Estudiantes2',
      Key: { id },
    });

    await this.client.send(command);
  }

  async updateTable() {              // Utilizado para el ejercicio 6
    const command = new UpdateTableCommand({
      TableName: 'Estudiantes2',
      AttributeDefinitions: [
        { AttributeName: 'nombre', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'NombreIndex',
            KeySchema: [
              { AttributeName: 'nombre', KeyType: 'HASH' },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        },
      ],
    });

    try {
      await this.client.send(command);
      console.log('GSI agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar el GSI:', error);
    }
  }

  async queryByName(name: string) {       // Utilizado para el ejercicio 6
    const command = new QueryCommand({
      TableName: 'Estudiantes2',
      IndexName: 'NombreIndex',
      KeyConditionExpression: '#nombre = :nombre',
      ExpressionAttributeNames: {
        '#nombre': 'nombre',
      },
      ExpressionAttributeValues: {
        ':nombre': { S: name }, 
      },
    });

    try {
      const result = await this.client.send(command);
      return result.Items;
    } catch (error) {
      console.error('Error al consultar por nombre:', error);
    }
  }

  async createCourse(item: CreateCourseDTO) {    // Utilizado para el ejercicio 7
    const command = new PutCommand({
      TableName: 'Cursos', 
      Item: item,
    });
  
    await this.client.send(command);
  }

  async updateStudentCourses(id: string, cursoIDs: string[]) { //Utilizado para el ejercicio 8
    const command = new UpdateCommand({
      TableName: 'Estudiantes2',
      Key: { id },
      UpdateExpression: 'SET #cursoIDs = :cursoIDs',
      ExpressionAttributeNames: { '#cursoIDs': 'CursoIDs' },
      ExpressionAttributeValues: { ':cursoIDs': cursoIDs },
    });

    await this.client.send(command);
  }

  async getStudentCourses(id: string) {  // Utilizado para el ejercicio 8
    const command = new GetCommand({
      TableName: 'Estudiantes2',
      Key: { id },
      ProjectionExpression: 'CursoIDs',
    });

    try {
      const result = await this.client.send(command);
      return result.Item?.CursoIDs || [];
    } catch (error) {
      console.error('Error al consultar los cursos del estudiante:', error);
    }
  }

  async getAllStudents() {
    const command = new ScanCommand({
      TableName: 'Estudiantes2',
    });

    try {
      const result = await this.client.send(command);
      return result.Items;
    } catch (error) {
      console.error('Error al obtener todos los estudiantes:', error);
    }
  }
}