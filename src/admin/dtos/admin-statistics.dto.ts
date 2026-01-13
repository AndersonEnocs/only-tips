import { ApiProperty } from '@nestjs/swagger';

export class AdminStatisticsDto {
    @ApiProperty({
        description: 'Total number of ideas in the system',
        example: 150
    })
    totalIdeas: number;

    @ApiProperty({
        description: 'Number of ideas that are pending payment',
        example: 25
    })
    pendingPayment: number;

    @ApiProperty({
        description: 'Number of ideas that have been received',
        example: 45
    })
    received: number;

    @ApiProperty({
        description: 'Number of ideas that have been reviewed',
        example: 60
    })
    reviewed: number;

    @ApiProperty({
        description: 'Number of ideas that have been selected',
        example: 15
    })
    selected: number;

    @ApiProperty({
        description: 'Number of ideas that were not selected',
        example: 5
    })
    notSelected: number;
}
