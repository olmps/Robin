import React from 'react'

// Models
import { RequestCycle } from '../../../../models'
import { 
  isSuccessStatusCode, 
  isInformationalStatusCode, 
  isRedirectStatusCode, 
  isClientErrorStatusCode, 
  isServerErrorStatusCode
} from '../../../../models/status-code'

// Assets
import informationIcon from '../../../../resources/assets/requests-details/stats/information.svg'
import successIcon from '../../../../resources/assets/requests-details/stats/success.svg'
import redirectIcon from '../../../../resources/assets/requests-details/stats/redirect.svg'
import syncIcon from '../../../../resources/assets/requests-details/stats/sync.svg'
import clientErrorIcon from '../../../../resources/assets/requests-details/stats/client_error.svg'
import serverErrorIcon from '../../../../resources/assets/requests-details/stats/server_error.svg'

// Style
import './RequestsStats.css'

const RequestsStats = ({ cycles }: { cycles: RequestCycle[] }) => {
    const [incomplete, informational, success, redirects, clientErrors, serverErrors] = requestsStates(cycles)

    return (
        <div className="StatsWrapper">
            <div className="StatsItem"><img src={informationIcon} />{informational} Informational</div>
            <div className="StatsItem"><img src={successIcon} />{success} Successful</div>
            <div className="StatsItem"><img src={redirectIcon} />{redirects} Redirects</div>
            <div className="StatsItem"><img src={clientErrorIcon} />{clientErrors} Client Errors</div>
            <div className="StatsItem"><img src={serverErrorIcon} />{serverErrors} Server Errors</div>
            <div className="StatsItem"><img src={syncIcon} />{incomplete} Incomplete</div>
        </div>
    )
}

function requestsStates(cycles: RequestCycle[]): string[] {
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

  return statsAmount.map(stats => stats.toString())
}

export default RequestsStats