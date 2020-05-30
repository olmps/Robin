import React from 'react'
import { HorizontalBar } from 'react-chartjs-2'

import { RequestCycle } from '../../../../models'

import './RequestsStats.css'

const RequestsStats = ({ cycles }: { cycles: RequestCycle[] }) => {
  return (
    <div className="BarChart">
      <HorizontalBar data={barChartData(cycles)} options={barChartOptions()} />
    </div>
  )
}

function barChartData(cycles: RequestCycle[]) {
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
      label: 'Status Code Amount',
      data: methodsAmount,
      borderWidth: 1,
      borderColor: [
        '#51B261FF',
        '#BC7446FF',
        '#4777BBFF',
        '#E6DA3AFF',
        '#BC4747FF',
      ],
      backgroundColor: [
        '#51B26180',
        '#BC744680',
        '#4777BB80',
        '#E6DA3A80',
        '#BC474780',
      ],
      hoverBackgroundColor: [
        '#51B261CC',
        '#BC7446CC',
        '#4777BBCC',
        '#E6DA3ACC',
        '#BC4747CC',
      ]
    }]
  }
}

function barChartOptions() {
  return {
    scales: {
      xAxes: [{
        gridLines: {
          display: true,
          color: "rgba(255,255,255,0.1)"
        },
        ticks: {
          fontColor: "white",
          fontStyle: 'normal'
        }
      }],
      yAxes: [{
        gridLines: {
          display: true,
          color: "rgba(255,255,255,0.1)"
        },
        ticks: {
          fontColor: '#FFF',
          fontStyle: 'bold'
        }
      }]
    },
    legend: {
      display: false
    }
  }
}

export default RequestsStats