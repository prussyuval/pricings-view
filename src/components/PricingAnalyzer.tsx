import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Clock, User, Plane, Info } from 'lucide-react';

interface PricingData {
  pricing_results: Array<{
    number: number;
    total_price: { amount: string; currency: string };
    fare_components: Array<{
      fare_basis: string;
      fare_family: string;
      private_indicator: string;
      segments: Array<{
        booking_class: string;
        carry_on_allowed: any;
      }>;
    }>;
    penalties: {
      change_penalty?: { amount: string; currency: string };
      refund_penalty?: { amount: string; currency: string } | null;
      reference_list: number[];
    };
    validating_carrier: string;
    ptc_type: string;
    rules_source: string[];
    price_quote_key: string;
    pricing_command_number: number;
    is_matched: any;
  }>;
  general_policy_offers_info: Record<string, Record<string, {
    result: boolean | null;
    should_check: boolean;
  }>>;
  policy_match_offers_info: Record<string, {
    change_match: { is_matched: boolean; message: string | null };
    refund_match: { is_matched: boolean; message: string | null };
  }>;
  fare_query?: any;
  corporate_codes?: any[];
  cycle_type?: string;
  is_renew?: boolean;
  ptc_type?: string;
  transaction_id?: string;
}

interface BookingInformation {
  branch?: any;
  account?: {
    annotations?: any;
    archived?: any;
    configuration?: {
      pricing?: {
        policies?: {
          policy_rule?: Array<{
            name: string;
            rule: string;
          }>;
        };
      };
    };
  };
  reservation_document?: any;
  organization?: any;
}

const CheckStatus: React.FC<{ 
  result: boolean | null; 
  should_check: boolean; 
  label: string;
  fieldName: string;
}> = ({ result, should_check, label, fieldName }) => {
  if (!should_check) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 group relative">
        <AlertCircle size={16} />
        <span className="text-sm">{label}: Not checked</span>
        <Info size={12} className="text-gray-400" />
        <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
          Field: {fieldName}
        </div>
      </div>
    );
  }

  if (result === true) {
    return (
      <div className="flex items-center space-x-2 text-green-600 group relative">
        <CheckCircle size={16} />
        <span className="text-sm">{label}: Passed</span>
        <Info size={12} className="text-gray-400" />
        <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
          Field: {fieldName}
        </div>
      </div>
    );
  }

  if (result === false) {
    return (
      <div className="flex items-center space-x-2 text-red-600 group relative">
        <XCircle size={16} />
        <span className="text-sm">{label}: Failed</span>
        <Info size={12} className="text-gray-400" />
        <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
          Field: {fieldName}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-yellow-600 group relative">
      <AlertCircle size={16} />
      <span className="text-sm">{label}: Unknown</span>
      <Info size={12} className="text-gray-400" />
      <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        Field: {fieldName}
      </div>
    </div>
  );
};

const PricingCard: React.FC<{
  pricing: PricingData['pricing_results'][0];
  index: number;
  generalPolicy: Record<string, { result: boolean | null; should_check: boolean }> | undefined;
  policyMatch: { change_match: { is_matched: boolean; message: string | null }; refund_match: { is_matched: boolean; message: string | null } } | undefined;
  bookingInfo?: BookingInformation;
}> = ({ pricing, index, generalPolicy, policyMatch, bookingInfo }) => {
  const getOverallGeneralPolicyStatus = () => {
    if (!generalPolicy) return 'unknown';
    
    const checkedResults = Object.values(generalPolicy).filter(check => check.should_check);
    if (checkedResults.length === 0) return 'not-checked';
    
    const allPassed = checkedResults.every(check => check.result === true);
    const anyFailed = checkedResults.some(check => check.result === false);
    
    if (allPassed) return 'passed';
    if (anyFailed) return 'failed';
    return 'partial';
  };

  const getOverallPolicyMatchStatus = () => {
    if (!policyMatch) return 'unknown';
    return policyMatch.change_match.is_matched && policyMatch.refund_match.is_matched ? 'matched' : 'not-matched';
  };

  const generalPolicyStatus = getOverallGeneralPolicyStatus();
  const policyMatchStatus = getOverallPolicyMatchStatus();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Plane className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pricing Option #{pricing.number}
            </h3>
            <p className="text-sm text-gray-500">Quote Key: {pricing.price_quote_key}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {pricing.total_price.amount} {pricing.total_price.currency}
          </div>
          <div className="text-sm text-gray-500">Total Price</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Policy Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="font-semibold text-gray-900">General Policy Validation</h4>
            {generalPolicyStatus === 'passed' && <CheckCircle className="text-green-500" size={20} />}
            {generalPolicyStatus === 'failed' && <XCircle className="text-red-500" size={20} />}
            {generalPolicyStatus === 'partial' && <AlertCircle className="text-yellow-500" size={20} />}
            {generalPolicyStatus === 'not-checked' && <AlertCircle className="text-gray-400" size={20} />}
          </div>

          {generalPolicy ? (
            <div className="space-y-2">
              <CheckStatus 
                result={generalPolicy.cabin_class_preserved?.result}
                should_check={generalPolicy.cabin_class_preserved?.should_check}
                label="Cabin Class Preserved"
                fieldName="cabin_class_preserved"
              />
              <CheckStatus 
                result={generalPolicy.carry_on_preserved?.result}
                should_check={generalPolicy.carry_on_preserved?.should_check}
                label="Carry-on Preserved"
                fieldName="carry_on_preserved"
              />
              <CheckStatus 
                result={generalPolicy.fare_family_preserved?.result}
                should_check={generalPolicy.fare_family_preserved?.should_check}
                label="Fare Family Preserved"
                fieldName="fare_family_preserved"
              />
              <CheckStatus 
                result={generalPolicy.fare_type_match?.result}
                should_check={generalPolicy.fare_type_match?.should_check}
                label="Fare Type Match"
                fieldName="fare_type_match"
              />
              <CheckStatus 
                result={generalPolicy.rebook_required?.result}
                should_check={generalPolicy.rebook_required?.should_check}
                label="Rebook Required"
                fieldName="rebook_required"
              />
              <CheckStatus 
                result={generalPolicy.rule_matched_check?.result}
                should_check={generalPolicy.rule_matched_check?.should_check}
                label="Rule Matched Check"
                fieldName="rule_matched_check"
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500">No general policy data available</div>
          )}
        </div>

        {/* Policy Match Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="font-semibold text-gray-900">Policy Match Status</h4>
            {policyMatchStatus === 'matched' && <CheckCircle className="text-green-500" size={20} />}
            {policyMatchStatus === 'not-matched' && <XCircle className="text-red-500" size={20} />}
          </div>

          {policyMatch ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 group relative">
                {policyMatch.change_match.is_matched ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <XCircle className="text-red-600" size={16} />
                )}
                <span className="text-sm">
                  Change Policy: {policyMatch.change_match.is_matched ? 'Matched' : 'Not Matched'}
                </span>
                <Info size={12} className="text-gray-400" />
                <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  Field: change_match
                </div>
              </div>
              {policyMatch.change_match.message && (
                <p className="text-xs text-gray-600 ml-6">{policyMatch.change_match.message}</p>
              )}

              <div className="flex items-center space-x-2 group relative">
                {policyMatch.refund_match.is_matched ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <XCircle className="text-red-600" size={16} />
                )}
                <span className="text-sm">
                  Refund Policy: {policyMatch.refund_match.is_matched ? 'Matched' : 'Not Matched'}
                </span>
                <Info size={12} className="text-gray-400" />
                <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  Field: refund_match
                </div>
              </div>
              {policyMatch.refund_match.message && (
                <p className="text-xs text-gray-600 ml-6">{policyMatch.refund_match.message}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No policy match data available</div>
          )}
        </div>
      </div>

      {/* Fare Details */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <DollarSign size={18} />
          <span>Fare Details</span>
        </h4>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Validating Carrier:</span>
              <span className="text-sm font-medium">{pricing.validating_carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Passenger Type:</span>
              <span className="text-sm font-medium">{pricing.ptc_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pricing Command:</span>
              <span className="text-sm font-medium">{pricing.pricing_command_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rules Source:</span>
              <span className="text-sm font-medium">{pricing.rules_source ? pricing.rules_source.join(', ') : 'N/A'}</span>
            </div>
          </div>

          {/* Penalties */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800">Penalties</h5>
            {pricing.penalties.change_penalty && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Change Penalty:</span>
                <span className="text-sm font-medium">
                  {pricing.penalties.change_penalty.amount} {pricing.penalties.change_penalty.currency}
                </span>
              </div>
            )}
            {!pricing.penalties.change_penalty && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Change Penalty:</span>
                <span className="text-sm font-medium text-gray-400">None</span>
              </div>
            )}
            {pricing.penalties.refund_penalty && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Refund Penalty:</span>
                <span className="text-sm font-medium">
                  {pricing.penalties.refund_penalty.amount} {pricing.penalties.refund_penalty.currency}
                </span>
              </div>
            )}
            {!pricing.penalties.refund_penalty && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Refund Penalty:</span>
                <span className="text-sm font-medium text-gray-400">None</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reference List:</span>
              <span className="text-sm font-medium text-right">
                {pricing.penalties.reference_list && pricing.penalties.reference_list.length > 0 
                  ? pricing.penalties.reference_list.join(', ') 
                  : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Fare Components */}
        {bookingInfo?.account?.configuration?.pricing?.policies?.policy_rule && (
          <div className="mt-6">
            <h5 className="font-medium text-gray-800 mb-3">Fare Components</h5>
            <div className="space-y-3">
              {pricing.fare_components.map((component, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fare Basis:</span>
                        <span className="text-sm font-medium">{component.fare_basis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fare Family:</span>
                        <span className="text-sm font-medium">{component.fare_family}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Private Indicator:</span>
                        <span className="text-sm font-medium">{component.private_indicator}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Segments:</span>
                      <div className="space-y-1">
                        {component.segments.map((segment, segIdx) => (
                          <div key={segIdx} className="text-sm">
                            <span className="font-medium">Class: {segment.booking_class}</span>
                            {segment.carry_on_allowed !== null && (
                              <span className="ml-2 text-gray-600">
                                (Carry-on: {segment.carry_on_allowed ? 'Yes' : 'No'})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {bookingInfo?.account?.configuration?.pricing?.policies?.policy_rule && (
          <div className="mt-6">
            <h5 className="font-medium text-gray-800 mb-3">Policy Rules</h5>
            <div className="space-y-2">
              {bookingInfo.account.configuration.pricing.policies.policy_rule.map((rule, ruleIdx) => (
                <div key={ruleIdx} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{rule.name}:</span>
                    <span className="ml-2 text-gray-600">{rule.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PricingAnalyzer: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = () => {
    try {
      const data = JSON.parse(jsonInput) as PricingData;
      setParsedData(data);
      setError('');
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
      setParsedData(null);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Analysis Tool</h1>
          <p className="text-gray-600">
            Paste your JSON data below to analyze pricing results, policy matches, and fare details.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">JSON Input</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON data here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!jsonInput.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Analyze Pricing
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Section */}
        {parsedData && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
              <div className="text-sm text-gray-500">
                Transaction ID: {parsedData.transaction_id}
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Total Pricing Options:</span>
                  <span className="ml-2 text-blue-700">{parsedData.pricing_results.length}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Passenger Type:</span>
                  <span className="ml-2 text-blue-700">{parsedData.ptc_type}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Cycle Type:</span>
                  <span className="ml-2 text-blue-700">{parsedData.cycle_type}</span>
                </div>
              </div>
            </div>

            {parsedData.pricing_results.map((pricing, index) => (
              <PricingCard
                key={index}
                pricing={pricing}
                index={index}
                generalPolicy={parsedData.general_policy_offers_info[index.toString()]}
                policyMatch={parsedData.policy_match_offers_info[index.toString()]}
                bookingInfo={parsedData as any}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};