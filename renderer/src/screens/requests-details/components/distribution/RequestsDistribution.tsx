import React from 'react'
import { Doughnut } from 'react-chartjs-2'

import { RequestCycle } from '../../../../models'

import { 
  isSuccessStatusCode, 
  isInformationalStatusCode, 
  isRedirectStatusCode, 
  isClientErrorStatusCode, 
  isServerErrorStatusCode
} from '../../../../models/status-code'

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
  let statsAmount = [0, 0, 0, 0, 0, 0] // Incomplete, Informational, Success, Redirection, Client Errors, Server Errors
  
  for (const cycle of cycles) {
    if (!cycle.isComplete) {
      statsAmount[0] += 1
      continue
    }
    
    if (isInformationalStatusCode(cycle.statusCode!)) { statsAmount[1] += 1 }
    if (isSuccessStatusCode(cycle.statusCode!)) { statsAmount[2] += 1 }
    if (isRedirectStatusCode(cycle.statusCode!)) { statsAmount[3] += 1 }
    if (isClientErrorStatusCode(cycle.statusCode!)) { statsAmount[4] += 1 }
    if (isServerErrorStatusCode(cycle.statusCode!)) { statsAmount[5] += 1 }
  }

  return {
    labels: [
      'Incomplete',
      'Informational',
      'Success',
      'Redirect',
      'Client Error',
      'Server Error'
    ],
    datasets: [{
      data: statsAmount,
      borderWidth: 0,
      backgroundColor: [
        '#E6DA3A',
        '#4777BB',
        '#51B261',
        '#BC7446',
        '#BC4747',
        "#000000"
      ],
      hoverBackgroundColor: [
        '#E6DA3A',
        '#4777BB',
        '#51B261',
        '#BC7446',
        '#BC4747',
        "#000000"
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