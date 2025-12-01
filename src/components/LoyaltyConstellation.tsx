import { Html, Text } from "@react-three/drei";

interface Customer {
  name: string;
  liters: number;
}

const CustomerBar = ({ customer, index, maxLiters }: { customer: Customer; index: number; maxLiters: number }) => {
  const height = maxLiters > 0 ? (customer.liters / maxLiters) * 5 : 0;
  const angle = (index / 10) * Math.PI * 2; // Arrange top 10 in a circle
  const radius = 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <group position={[x, 0, z]}>
      <mesh scale={[1, height, 1]} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial color={index % 2 === 0 ? "#2196F3" : "#4CAF50"} />
      </mesh>
      <Html position={[0, height + 0.5, 0]} center>
        <div style={{
          width: '120px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#333',
          fontSize: '14px',
        }}>
          <strong>{customer.name}</strong><br />
          {customer.liters.toFixed(1)} L
        </div>
      </Html>
    </group>
  );
};

export function LoyaltyConstellation({ loyaltyMetrics, ...props }: { loyaltyMetrics: { topCustomers: Customer[] } } & JSX.IntrinsicElements['group']) {
  const { topCustomers } = loyaltyMetrics;
  const hasData = topCustomers && topCustomers.length > 0;
  const maxLiters = hasData ? Math.max(...topCustomers.map(c => c.liters)) : 0;

  return (
    <group {...props}>
      {!hasData && <Text position={[0, 0, 0]} fontSize={0.3} color="#333">No customer data available</Text>}
      {hasData && topCustomers.slice(0, 10).map((customer, index) => (
        <CustomerBar key={customer.name} customer={customer} index={index} maxLiters={maxLiters} />
      ))}
    </group>
  );
}