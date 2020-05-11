import React from 'react'
import { Doughnut } from 'react-chartjs-2'

import { RequestCycle } from '../../../../models'

import './RequestsDistribution.css'

const RequestsDistribution = ({ cycles }: { cycles: RequestCycle[] }) => {
  return (
    <div className="DoughnutChart">
      <Doughnut data={doughnutChartData(cycles)} options={doughnutChartOptions()} />
    </div>
  )
}

/**
 * Requests methods distribution dataset
 */
function doughnutChartData(cycles: RequestCycle[]) {
  let methodsAmount = [0, 0, 0, 0, 0] // get, put, post, patch, delete
  cycles.forEach(cycle => methodsAmount[cycle.method] += 1)

  return {
    labels: [
      'GET',
      'PUT',
      'POST',
      'PATCH',
      'DELETE'
    ],
    datasets: [{
      data: methodsAmount,
      borderWidth: 0,
      backgroundColor: [
        '#51B261',
        '#BC7446',
        '#4777BB',
        '#E6DA3A',
        '#BC4747'
      ],
      hoverBackgroundColor: [
        '#51B261',
        '#BC7446',
        '#4777BB',
        '#E6DA3A',
        '#BC4747'
      ]
    }]
  }
}

function doughnutChartOptions(): any {
  return {
    legend: {
      position: 'bottom',
      labels: {
        fontColor: '#FFFFFF'
      }
    }
  }
}

export default RequestsDistribution